let program;
let allPasswords = new Map(); // 存储所有密码数据
let filteredPasswords = new Map(); // 存储过滤后的密码数据
let selectedItems = new Set(); // 存储选中的项目

// 打开添加密码窗口
let openAddWindow = () => {
    program.send("openAddWindow", {}).then(() => {
        // 窗口打开成功
    }).catch(err => {
        showNotification("打开窗口失败: " + err, "error");
    });
};

// 刷新密码列表
let refreshList = () => {
    program.send("refreshList", {}).then(() => {
        showNotification("列表已刷新", "success");
    }).catch(err => {
        showNotification("刷新失败: " + err, "error");
    });
};

// 删除密码函数
let del = (name)=>{
    return new Promise((resolve,reject)=>{
        program.send("del",name).then(()=>{
            // 从本地数据中删除
            allPasswords.delete(name);
            updateFilteredPasswords();
            resolve();
        }).catch(msg=>{
            reject(msg);
        });
    });
};

// 批量删除函数
let batchDelete = async ()=>{
    if(selectedItems.size === 0) {
        showNotification("请先选择要删除的项目", "warning");
        return;
    }

    const confirmed = await showConfirmDialog(
        `确定要删除选中的 ${selectedItems.size} 个密码吗？此操作不可撤销。`,
        "批量删除确认"
    );

    if(!confirmed) {
        return;
    }

    const promises = Array.from(selectedItems).map(name => del(name));
    Promise.all(promises).then(() => {
        selectedItems.clear();
        updateSelectAllState();
        showNotification(`成功删除 ${promises.length} 个密码`, "success");
        document.getElementById("deleteSelected").style.display = "none";
    }).catch(err => {
        showNotification("删除失败: " + err, "error");
    });
};

// 隐藏字符串函数
let hideString=(string)=>{
    if(!string || !string.length){
        return "无";
    }else if(string.length<3){
        return "***";
    }else if(string.length<=5){
        return string.slice(0,1)+"***";
    }else{
        return string.slice(0,1)+"***"+string.slice(-1);
    }
};



// 搜索过滤函数
let updateFilteredPasswords = () => {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    filteredPasswords.clear();

    if (!searchTerm) {
        // 如果没有搜索词，显示所有密码
        allPasswords.forEach((value, key) => {
            filteredPasswords.set(key, value);
        });
    } else {
        // 根据搜索词过滤
        allPasswords.forEach((value, key) => {
            if (key.toLowerCase().includes(searchTerm) ||
                value.account.toLowerCase().includes(searchTerm)) {
                filteredPasswords.set(key, value);
            }
        });
    }

    renderPasswordList();
};

// 显示通知
let showNotification = (message, type = "info") => {
    // 创建通知元素
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // 添加样式
    Object.assign(notification.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "12px 20px",
        borderRadius: "4px",
        color: "#fff",
        fontSize: "14px",
        zIndex: "9999",
        opacity: "0",
        transform: "translateX(100%)",
        transition: "all 0.3s ease"
    });

    // 根据类型设置背景色
    const colors = {
        success: "#00b894",
        error: "#e17055",
        warning: "#fdcb6e",
        info: "#74b9ff"
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateX(0)";
    }, 10);

    // 自动隐藏
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// 自定义确认对话框
let showConfirmDialog = (message, title = "确认操作") => {
    return new Promise((resolve) => {
        // 创建对话框元素
        const dialog = document.createElement("div");
        dialog.className = "confirm-dialog";
        dialog.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-header">
                    <h3>${title}</h3>
                </div>
                <div class="confirm-body">
                    <p>${message}</p>
                </div>
                <div class="confirm-footer">
                    <div class="btn btn-secondary confirm-cancel">取消</div>
                    <div class="btn btn-danger confirm-ok">确认</div>
                </div>
            </div>
        `;

        // 添加样式
        Object.assign(dialog.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "10000",
            opacity: "0",
            transition: "opacity 0.3s ease"
        });

        document.body.appendChild(dialog);

        // 显示动画
        setTimeout(() => {
            dialog.style.opacity = "1";
        }, 10);

        // 事件处理
        const cleanup = () => {
            dialog.style.opacity = "0";
            setTimeout(() => {
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
            }, 300);
        };

        dialog.querySelector(".confirm-ok").addEventListener("click", () => {
            cleanup();
            resolve(true);
        });

        dialog.querySelector(".confirm-cancel").addEventListener("click", () => {
            cleanup();
            resolve(false);
        });

        // 点击背景关闭
        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) {
                cleanup();
                resolve(false);
            }
        });

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === "Escape") {
                cleanup();
                resolve(false);
                document.removeEventListener("keydown", escHandler);
            }
        };
        document.addEventListener("keydown", escHandler);
    });
};


// 渲染密码列表
let renderPasswordList = () => {
    const listElement = document.getElementById("list");
    const emptyState = document.getElementById("emptyState");
    const totalCount = document.getElementById("totalCount");

    // 清空现有列表（保留表头）
    const items = listElement.querySelectorAll(".item:not(.header)");
    items.forEach(item => item.remove());

    // 更新总数
    totalCount.textContent = filteredPasswords.size;

    if (filteredPasswords.size === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    // 渲染每个密码项
    filteredPasswords.forEach((data, name) => {
        const itemElement = createPasswordItem(name, data.account, data.pwd, data.notes);
        listElement.appendChild(itemElement);
    });

    updateSelectAllState();
};

// 创建密码项元素
let createPasswordItem = (name, account, pwd, notes) => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("item");
    itemElement.dataset.name = name;

    // 选择框
    const selectElement = document.createElement("div");
    selectElement.classList.add("select-col");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            selectedItems.add(name);
            itemElement.classList.add("selected");
        } else {
            selectedItems.delete(name);
            itemElement.classList.remove("selected");
        }
        updateSelectAllState();
        updateDeleteButtonVisibility();
    });
    selectElement.appendChild(checkbox);

    // 名称
    const nameElement = document.createElement("div");
    nameElement.textContent = name;
    nameElement.title = name;

    // 账号
    const accountElement = document.createElement("div");
    accountElement.textContent = hideString(account);
    accountElement.title = account;

    // 密码
    const pwdElement = document.createElement("div");
    pwdElement.textContent = "***";

    // 操作按钮
    const actionElement = document.createElement("div");
    actionElement.classList.add("action");

    // 复制账号按钮
    if (account && account.length > 0) {
        const copyAccountBtn = document.createElement("div");
        copyAccountBtn.classList.add("btn", "btn-secondary");
        copyAccountBtn.textContent = "复制账号";
        copyAccountBtn.addEventListener("click", () => {
            program.send("copy", account).then(() => {
                showNotification("账号复制成功", "success");
            }).catch(err => {
                showNotification("复制失败: " + err, "error");
            });
        });
        actionElement.appendChild(copyAccountBtn);
    }

    // 复制密码按钮
    const copyPwdBtn = document.createElement("div");
    copyPwdBtn.classList.add("btn", "btn-secondary");
    copyPwdBtn.textContent = "复制密码";
    copyPwdBtn.addEventListener("click", () => {
        program.send("copy", pwd).then(() => {
            showNotification("密码复制成功", "success");
        }).catch(err => {
            showNotification("复制失败: " + err, "error");
        });
    });
    actionElement.appendChild(copyPwdBtn);

    // 删除按钮
    const deleteBtn = document.createElement("div");
    deleteBtn.classList.add("btn", "btn-danger");
    deleteBtn.textContent = "删除";
    deleteBtn.addEventListener("click", async () => {
        const confirmed = await showConfirmDialog(
            `确定要删除密码 "${name}" 吗？此操作不可撤销。`,
            "删除确认"
        );

        if (confirmed) {
            del(name).then(() => {
                showNotification("删除成功", "success");
            }).catch(err => {
                showNotification("删除失败: " + err, "error");
            });
        }
    });
    actionElement.appendChild(deleteBtn);

    // 组装元素
    itemElement.appendChild(selectElement);
    itemElement.appendChild(nameElement);
    itemElement.appendChild(accountElement);
    itemElement.appendChild(pwdElement);
    itemElement.appendChild(actionElement);

    return itemElement;
};
// 更新全选状态
let updateSelectAllState = () => {
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    const totalItems = filteredPasswords.size;
    const selectedCount = selectedItems.size;

    if (totalItems === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === totalItems) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedCount > 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
};

// 更新删除按钮可见性
let updateDeleteButtonVisibility = () => {
    const deleteBtn = document.getElementById("deleteSelected");
    if (selectedItems.size > 0) {
        deleteBtn.style.display = "inline-block";
        deleteBtn.textContent = `删除选中(${selectedItems.size})`;
    } else {
        deleteBtn.style.display = "none";
    }
};





window.onload = ()=>{
    program = initProgram();

    // 窗口控制事件
    document.getElementById("close").addEventListener("click",()=>{
        program.message("close");
    });
    document.getElementById("init").addEventListener("click",()=>{
        program.message("init");
    });

    // 帮助对话框
    const showHelp = () => {
        document.getElementById("helpModal").style.display = "flex";
    };

    const hideHelp = () => {
        document.getElementById("helpModal").style.display = "none";
    };

    document.getElementById("showHelp").addEventListener("click", showHelp);
    document.getElementById("closeHelp").addEventListener("click", hideHelp);
    document.getElementById("closeHelpBtn").addEventListener("click", hideHelp);

    // 点击帮助模态框背景关闭
    document.getElementById("helpModal").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
            hideHelp();
        }
    });

    // 搜索功能
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", updateFilteredPasswords);
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            updateFilteredPasswords();
        }
    });

    // 清空搜索
    document.getElementById("clearSearch").addEventListener("click", () => {
        searchInput.value = "";
        updateFilteredPasswords();
        searchInput.focus();
    });

    // 操作栏控制
    document.getElementById("openAddWindow").addEventListener("click", openAddWindow);
    document.getElementById("refreshList").addEventListener("click", refreshList);






    // 全选功能
    document.getElementById("selectAllCheckbox").addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        selectedItems.clear();

        if (isChecked) {
            filteredPasswords.forEach((_, name) => {
                selectedItems.add(name);
            });
        }

        // 更新所有复选框状态
        const checkboxes = document.querySelectorAll(".item:not(.header) input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const item = checkbox.closest(".item");
            if (isChecked) {
                item.classList.add("selected");
            } else {
                item.classList.remove("selected");
            }
        });

        updateDeleteButtonVisibility();
    });

    // 批量删除
    document.getElementById("deleteSelected").addEventListener("click", batchDelete);

    // 操作栏控制
    document.getElementById("openAddWindow").addEventListener("click", openAddWindow);
    document.getElementById("refreshList").addEventListener("click", refreshList);

    // 监听密码数据
    program.listen("pwds", (pwds) => {
        allPasswords.clear();
        pwds.forEach((item, name) => {
            allPasswords.set(name, {
                account: item.account,
                pwd: item.pwd,
                notes: item.notes || ""
            });
        });
        updateFilteredPasswords();
    });

    // 监听刷新列表消息
    program.listen("refresh-list", () => {
        // 静默刷新密码列表
        program.send("refreshList", {}).then(() => {
            // 刷新成功
        }).catch(err => {
            console.log("刷新失败:", err);
        });
    });

    // 键盘快捷键
    document.addEventListener("keydown", (e) => {
        // F1 显示帮助
        if (e.key === "F1") {
            e.preventDefault();
            showHelp();
        }
        // Ctrl+F 聚焦搜索框
        if (e.ctrlKey && e.key === "f") {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        // Ctrl+N 打开添加窗口
        if (e.ctrlKey && e.key === "n") {
            e.preventDefault();
            openAddWindow();
        }
        // ESC 清空搜索或关闭模态框
        if (e.key === "Escape") {
            if (document.getElementById("helpModal").style.display === "flex") {
                hideHelp();
            } else if (document.activeElement === searchInput) {
                searchInput.value = "";
                updateFilteredPasswords();
                searchInput.blur();
            }
        }
    });
};
