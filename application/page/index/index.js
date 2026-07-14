const { createApp, nextTick } = require("vue");

let program;

let normalizeNote = (notes) => {
    if (notes === undefined || notes === null) {
        return "";
    }
    return String(notes).trim();
};

window.onload = () => {
    createApp({
        data() {
            return {
                passwords: [],
                searchTerm: "",
                selectedNames: [],
                helpVisible: false,
                notifications: [],
                nextNotificationId: 1,
                confirmDialog: {
                    visible: false,
                    title: "确认操作",
                    message: "",
                    resolve: null
                },
                noteTooltip: {
                    visible: false,
                    text: "",
                    x: 0,
                    y: 0
                },
                dialogMaskVisible: false,
                keydownHandler: null
            };
        },
        computed: {
            filteredPasswords() {
                const searchTerm = this.searchTerm.toLowerCase().trim();

                if (!searchTerm) {
                    return this.passwords;
                }

                return this.passwords.filter((item) => {
                    const name = (item.name || "").toLowerCase();
                    const account = (item.account || "").toLowerCase();
                    const notes = (item.notes || "").toLowerCase();
                    return name.includes(searchTerm) || account.includes(searchTerm) || notes.includes(searchTerm);
                });
            },
            filteredSelectedCount() {
                const selectedSet = new Set(this.selectedNames);
                return this.filteredPasswords.filter((item) => selectedSet.has(item.name)).length;
            },
            isAllSelected() {
                return this.filteredPasswords.length > 0 && this.filteredSelectedCount === this.filteredPasswords.length;
            },
            isIndeterminate() {
                return this.filteredSelectedCount > 0 && !this.isAllSelected;
            }
        },
        watch: {
            filteredPasswords() {
                this.updateSelectAllIndeterminate();
            },
            selectedNames() {
                this.updateSelectAllIndeterminate();
            }
        },
        mounted() {
            program = initProgram();

            program.listen("pwds", (pwds) => {
                const passwords = [];
                pwds.forEach((item, name) => {
                    passwords.push({
                        name,
                        account: item.account || "",
                        pwd: item.pwd || "",
                        notes: normalizeNote(item.notes)
                    });
                });
                this.passwords = passwords;
                this.syncSelectionWithPasswords();
            });

            program.listen("refresh-list", () => {
                this.refreshList(false);
            });

            program.listen("dialog-mask", (visible) => {
                this.dialogMaskVisible = !!visible;
            });

            this.keydownHandler = (event) => this.handleKeydown(event);
            document.addEventListener("keydown", this.keydownHandler);
            this.updateSelectAllIndeterminate();
        },
        updated() {
            this.updateSelectAllIndeterminate();
        },
        beforeUnmount() {
            if (this.keydownHandler) {
                document.removeEventListener("keydown", this.keydownHandler);
            }
        },
        methods: {
            openAddWindow() {
                program.send("openAddWindow", {}).catch((err) => {
                    this.showNotification("打开窗口失败: " + err, "error");
                });
            },
            refreshList(showMessage = true) {
                program.send("refreshList", {}).then(() => {
                    if (showMessage) {
                        this.showNotification("列表已刷新", "success");
                    }
                }).catch((err) => {
                    this.showNotification("刷新失败: " + err, "error");
                });
            },
            async deletePassword(name) {
                const confirmed = await this.showConfirmDialog(
                    `确定要删除密码 "${name}" 吗？此操作不可撤销。`,
                    "删除确认"
                );

                if (!confirmed) {
                    return;
                }

                this.removePassword(name).then(() => {
                    this.showNotification("删除成功", "success");
                }).catch((err) => {
                    this.showNotification("删除失败: " + err, "error");
                });
            },
            async batchDelete() {
                if (this.selectedNames.length === 0) {
                    this.showNotification("请先选择要删除的项目", "warning");
                    return;
                }

                const names = [...this.selectedNames];
                const confirmed = await this.showConfirmDialog(
                    `确定要删除选中的 ${names.length} 个密码吗？此操作不可撤销。`,
                    "批量删除确认"
                );

                if (!confirmed) {
                    return;
                }

                Promise.all(names.map((name) => this.removePassword(name))).then(() => {
                    this.showNotification(`成功删除 ${names.length} 个密码`, "success");
                }).catch((err) => {
                    this.showNotification("删除失败: " + err, "error");
                });
            },
            removePassword(name) {
                return program.send("del", name).then(() => {
                    this.passwords = this.passwords.filter((item) => item.name !== name);
                    this.selectedNames = this.selectedNames.filter((selectedName) => selectedName !== name);
                });
            },
            copyText(text, successMessage) {
                program.send("copy", text).then(() => {
                    this.showNotification(successMessage, "success");
                }).catch((err) => {
                    this.showNotification("复制失败: " + err, "error");
                });
            },
            clearSearch(shouldFocus = true) {
                this.searchTerm = "";
                if (shouldFocus) {
                    nextTick(() => {
                        this.$refs.searchInput && this.$refs.searchInput.focus();
                    });
                }
            },
            toggleSelected(name, checked) {
                if (checked && !this.selectedNames.includes(name)) {
                    this.selectedNames = [...this.selectedNames, name];
                    return;
                }

                if (!checked) {
                    this.selectedNames = this.selectedNames.filter((selectedName) => selectedName !== name);
                }
            },
            toggleSelectAll(checked) {
                const visibleNames = this.filteredPasswords.map((item) => item.name);

                if (checked) {
                    const selectedSet = new Set(this.selectedNames);
                    visibleNames.forEach((name) => selectedSet.add(name));
                    this.selectedNames = Array.from(selectedSet);
                    return;
                }

                const visibleNameSet = new Set(visibleNames);
                this.selectedNames = this.selectedNames.filter((name) => !visibleNameSet.has(name));
            },
            toggleSelectAllButton() {
                this.toggleSelectAll(!this.isAllSelected);
            },
            isSelected(name) {
                return this.selectedNames.includes(name);
            },
            updateSelectAllIndeterminate() {
                nextTick(() => {
                    if (this.$refs.selectAllCheckbox) {
                        this.$refs.selectAllCheckbox.indeterminate = this.isIndeterminate;
                    }
                });
            },
            syncSelectionWithPasswords() {
                const names = new Set(this.passwords.map((item) => item.name));
                this.selectedNames = this.selectedNames.filter((name) => names.has(name));
            },
            hideString(string) {
                if (!string || !string.length) {
                    return "无";
                }
                if (string.length < 3) {
                    return "***";
                }
                if (string.length <= 5) {
                    return string.slice(0, 1) + "***";
                }
                return string.slice(0, 1) + "***" + string.slice(-1);
            },
            showNoteTooltip(event, item) {
                if (!item.notes) {
                    return;
                }

                this.noteTooltip = {
                    visible: true,
                    text: item.notes,
                    ...this.getTooltipPosition(event)
                };
            },
            moveNoteTooltip(event) {
                if (!this.noteTooltip.visible) {
                    return;
                }

                this.noteTooltip = {
                    ...this.noteTooltip,
                    ...this.getTooltipPosition(event)
                };
            },
            hideNoteTooltip() {
                this.noteTooltip = {
                    visible: false,
                    text: "",
                    x: 0,
                    y: 0
                };
            },
            getTooltipPosition(event) {
                return {
                    x: Math.max(8, Math.min(event.clientX + 12, window.innerWidth - 340)),
                    y: Math.max(8, Math.min(event.clientY + 12, window.innerHeight - 120))
                };
            },
            showNotification(message, type = "info") {
                const id = this.nextNotificationId++;
                this.notifications = [...this.notifications, { id, message, type }];

                setTimeout(() => {
                    this.notifications = this.notifications.filter((notice) => notice.id !== id);
                }, 3000);
            },
            showConfirmDialog(message, title = "确认操作") {
                return new Promise((resolve) => {
                    this.confirmDialog = {
                        visible: true,
                        title,
                        message,
                        resolve
                    };
                });
            },
            resolveConfirm(result) {
                const resolve = this.confirmDialog.resolve;
                this.confirmDialog = {
                    visible: false,
                    title: "确认操作",
                    message: "",
                    resolve: null
                };

                if (resolve) {
                    resolve(result);
                }
            },
            showHelp() {
                this.helpVisible = true;
            },
            hideHelp() {
                this.helpVisible = false;
            },
            closeWindow() {
                program.message("close");
            },
            resetSecret() {
                program.message("init");
            },
            handleKeydown(event) {
                const key = event.key.toLowerCase();

                if (event.key === "F1") {
                    event.preventDefault();
                    this.showHelp();
                    return;
                }

                if (event.ctrlKey && key === "f") {
                    event.preventDefault();
                    this.$refs.searchInput && this.$refs.searchInput.focus();
                    this.$refs.searchInput && this.$refs.searchInput.select();
                    return;
                }

                if (event.ctrlKey && key === "n") {
                    event.preventDefault();
                    this.openAddWindow();
                    return;
                }

                if (event.key === "Escape") {
                    if (this.confirmDialog.visible) {
                        this.resolveConfirm(false);
                        return;
                    }

                    if (this.helpVisible) {
                        this.hideHelp();
                        return;
                    }

                    if (document.activeElement === this.$refs.searchInput) {
                        this.clearSearch(false);
                        this.$refs.searchInput.blur();
                    }
                }
            }
        }
    }).mount("#app");
};
