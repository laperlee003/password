const { createApp, nextTick } = require("vue");

let program;

let generatePassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

let generateAdvancedPassword = (options) => {
    let charset = "";

    if (options.includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (options.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.includeNumbers) charset += "0123456789";
    if (options.includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (options.excludeSimilar) {
        charset = charset.replace(/[0Ol1I]/g, "");
    }

    if (charset.length === 0) {
        throw new Error("至少选择一种字符类型");
    }

    let password = "";
    for (let i = 0; i < options.length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
};

let checkPasswordStrength = (password) => {
    if (!password) return { score: 0, text: "请输入密码", level: "" };

    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push("至少8个字符");

    if (password.length >= 12) score += 1;

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("包含小写字母");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("包含大写字母");

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("包含数字");

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push("包含特殊字符");

    if (password.length >= 16) score += 1;
    if (!/(.)\1{2,}/.test(password)) score += 1;

    if (score <= 2) {
        return { score, text: "弱 - " + feedback.slice(0, 2).join(", "), level: "weak" };
    }
    if (score <= 4) {
        return { score, text: "一般 - " + (feedback.length > 0 ? feedback.slice(0, 1).join(", ") : "还可以更强"), level: "fair" };
    }
    if (score <= 6) {
        return { score, text: "良好 - 密码强度不错", level: "good" };
    }
    return { score, text: "强 - 密码很安全", level: "strong" };
};

window.onload = () => {
    createApp({
        data() {
            return {
                form: {
                    name: "",
                    account: "",
                    pwd: "",
                    notes: ""
                },
                passwordVisible: false,
                saving: false,
                generatorVisible: false,
                generator: {
                    length: 12,
                    includeLowercase: true,
                    includeUppercase: true,
                    includeNumbers: true,
                    includeSymbols: false,
                    excludeSimilar: false
                },
                generatedPassword: "",
                notifications: [],
                nextNotificationId: 1,
                keydownHandler: null
            };
        },
        computed: {
            passwordInputType() {
                return this.passwordVisible ? "text" : "password";
            },
            passwordToggleText() {
                return this.passwordVisible ? "隐藏" : "显示";
            },
            passwordStrength() {
                return checkPasswordStrength(this.form.pwd);
            }
        },
        mounted() {
            program = initProgram();

            this.keydownHandler = (event) => this.handleKeydown(event);
            document.addEventListener("keydown", this.keydownHandler);

            nextTick(() => {
                this.$refs.addName && this.$refs.addName.focus();
            });
        },
        beforeUnmount() {
            if (this.keydownHandler) {
                document.removeEventListener("keydown", this.keydownHandler);
            }
        },
        methods: {
            save() {
                if (this.saving) {
                    this.showNotification("正在处理中，请稍候...", "warning");
                    return;
                }

                if (!this.form.name) {
                    this.showNotification("请输入名称", "error");
                    return;
                }
                if (!this.form.account) {
                    this.showNotification("请输入账号", "error");
                    return;
                }
                if (!this.form.pwd) {
                    this.showNotification("请输入密码", "error");
                    return;
                }

                this.saving = true;

                program.send("submit", {
                    name: this.form.name,
                    account: this.form.account,
                    pwd: this.form.pwd,
                    notes: this.form.notes
                }).then(() => {
                    this.showNotification("密码保存成功", "success");
                    setTimeout(() => {
                        this.closeDialogWindow();
                    }, 800);
                }).catch((err) => {
                    this.showNotification(err, "error");
                }).finally(() => {
                    this.saving = false;
                });
            },
            togglePasswordVisibility() {
                this.passwordVisible = !this.passwordVisible;
            },
            fillSimplePassword() {
                this.form.pwd = generatePassword(12);
                this.showNotification("密码已生成", "success");
            },
            showPasswordGenerator() {
                this.generatorVisible = true;
                this.generator = {
                    length: 12,
                    includeLowercase: true,
                    includeUppercase: true,
                    includeNumbers: true,
                    includeSymbols: false,
                    excludeSimilar: false
                };
                nextTick(() => {
                    this.generateModalPassword();
                });
            },
            hidePasswordGenerator() {
                this.generatorVisible = false;
            },
            generateModalPassword() {
                try {
                    this.generatedPassword = generateAdvancedPassword(this.generator);
                } catch (error) {
                    this.generatedPassword = "";
                    this.showNotification(error.message, "error");
                }
            },
            useGeneratedPassword() {
                if (!this.generatedPassword) {
                    return;
                }

                this.form.pwd = this.generatedPassword;
                this.hidePasswordGenerator();
                this.showNotification("密码已应用", "success");
            },
            copyGeneratedPassword() {
                if (!this.generatedPassword) {
                    return;
                }

                program.send("copy", this.generatedPassword).then(() => {
                    this.showNotification("密码已复制", "success");
                }).catch((err) => {
                    this.showNotification("复制失败: " + err, "error");
                });
            },
            closeDialogWindow() {
                closeDialog();
            },
            showNotification(message, type = "info") {
                const id = this.nextNotificationId++;
                this.notifications = [...this.notifications, { id, message, type }];

                setTimeout(() => {
                    this.notifications = this.notifications.filter((notice) => notice.id !== id);
                }, 3000);
            },
            handleKeydown(event) {
                const key = event.key.toLowerCase();

                if (event.key === "Escape") {
                    if (this.generatorVisible) {
                        this.hidePasswordGenerator();
                    } else {
                        this.closeDialogWindow();
                    }
                    return;
                }

                if (event.ctrlKey && key === "s") {
                    event.preventDefault();
                    this.save();
                    return;
                }

                if (event.ctrlKey && key === "g") {
                    event.preventDefault();
                    this.fillSimplePassword();
                }
            }
        }
    }).mount("#app");
};
