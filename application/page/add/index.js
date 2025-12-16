let program;

// 简单密码生成器
let generatePassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

// 高级密码生成器
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

// 密码强度检测
let checkPasswordStrength = (password) => {
    if (!password) return { score: 0, text: "请输入密码", level: "" };
    
    let score = 0;
    let feedback = [];
    
    // 长度检查
    if (password.length >= 8) score += 1;
    else feedback.push("至少8个字符");
    
    if (password.length >= 12) score += 1;
    
    // 字符类型检查
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("包含小写字母");
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("包含大写字母");
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("包含数字");
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push("包含特殊字符");
    
    // 复杂度检查
    if (password.length >= 16) score += 1;
    if (!/(.)\1{2,}/.test(password)) score += 1; // 没有连续重复字符
    
    let level, text;
    if (score <= 2) {
        level = "weak";
        text = "弱 - " + feedback.slice(0, 2).join(", ");
    } else if (score <= 4) {
        level = "fair";
        text = "一般 - " + (feedback.length > 0 ? feedback.slice(0, 1).join(", ") : "还可以更强");
    } else if (score <= 6) {
        level = "good";
        text = "良好 - 密码强度不错";
    } else {
        level = "strong";
        text = "强 - 密码很安全";
    }
    
    return { score, text, level };
};

// 更新密码强度显示
let updatePasswordStrength = (password) => {
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");
    
    const result = checkPasswordStrength(password);
    
    strengthFill.className = `strength-fill ${result.level}`;
    strengthText.textContent = result.text;
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

// 保存密码函数
let save = () => {
    const submitBtn = document.getElementById("submitAdd");
    if(submitBtn.classList.contains("disable")){
        return Promise.reject("正在处理中，请稍候...");
    }
    
    let name = document.getElementById("addName").value.trim();
    let account = document.getElementById("addAccount").value.trim();
    let pwd = document.getElementById("addPwd").value;
    let notes = document.getElementById("addNotes").value.trim();
    
    // 输入验证
    if(!name) {
        return Promise.reject("请输入名称");
    }
    if(!account) {
        return Promise.reject("请输入账号");
    }
    if(!pwd) {
        return Promise.reject("请输入密码");
    }
    
    submitBtn.classList.add("disable");
    submitBtn.textContent = "保存中...";
    
    return new Promise((resolve,reject)=>{
        program.send("submit",{
            name,
            account,
            pwd,
            notes
        }).then(()=>{
            submitBtn.classList.remove("disable");
            submitBtn.textContent = "保存密码";
            resolve({name, account, pwd, notes});
        }).catch(msg=>{
            submitBtn.classList.remove("disable");
            submitBtn.textContent = "保存密码";
            reject(msg);
        });
    });
};

// 清空表单
let clearForm = () => {
    document.getElementById("addName").value = "";
    document.getElementById("addAccount").value = "";
    document.getElementById("addPwd").value = "";
    document.getElementById("addNotes").value = "";
    updatePasswordStrength("");
    showNotification("表单已清空", "info");
};

// 切换密码可见性
let togglePasswordVisibility = () => {
    const pwdInput = document.getElementById("addPwd");
    const toggleBtn = document.getElementById("togglePwdVisibility");

    if (pwdInput.type === "password") {
        pwdInput.type = "text";
        toggleBtn.textContent = "隐藏";
    } else {
        pwdInput.type = "password";
        toggleBtn.textContent = "显示";
    }
};

// 显示高级密码生成器
let showPasswordGenerator = () => {
    const modal = document.getElementById("passwordGeneratorModal");
    modal.style.display = "flex";

    // 重置选项
    document.getElementById("lengthSlider").value = 12;
    document.getElementById("lengthValue").textContent = "12";
    document.getElementById("includeLowercase").checked = true;
    document.getElementById("includeUppercase").checked = true;
    document.getElementById("includeNumbers").checked = true;
    document.getElementById("includeSymbols").checked = false;
    document.getElementById("excludeSimilar").checked = false;

    // 生成初始密码
    generateModalPassword();
};

// 隐藏高级密码生成器
let hidePasswordGenerator = () => {
    const modal = document.getElementById("passwordGeneratorModal");
    modal.style.display = "none";
};

// 在模态框中生成密码
let generateModalPassword = () => {
    try {
        const options = {
            length: parseInt(document.getElementById("lengthSlider").value),
            includeLowercase: document.getElementById("includeLowercase").checked,
            includeUppercase: document.getElementById("includeUppercase").checked,
            includeNumbers: document.getElementById("includeNumbers").checked,
            includeSymbols: document.getElementById("includeSymbols").checked,
            excludeSimilar: document.getElementById("excludeSimilar").checked
        };

        const password = generateAdvancedPassword(options);
        document.getElementById("generatedPassword").value = password;
    } catch (error) {
        document.getElementById("generatedPassword").value = "";
        showNotification(error.message, "error");
    }
};

// 使用生成的密码
let useGeneratedPassword = () => {
    const password = document.getElementById("generatedPassword").value;
    if (password) {
        document.getElementById("addPwd").value = password;
        updatePasswordStrength(password);
        hidePasswordGenerator();
        showNotification("密码已应用", "success");
    }
};

window.onload = () => {
    program = initProgram();

    // 窗口控制事件
    document.getElementById("close").addEventListener("click", () => {
        closeDialog();
    });

    document.getElementById("cancel").addEventListener("click", () => {
        closeDialog();
    });

    // 表单控制
    document.getElementById("togglePwdVisibility").addEventListener("click", togglePasswordVisibility);

    // 密码生成
    document.getElementById("generatePwd").addEventListener("click", () => {
        const password = generatePassword(12);
        document.getElementById("addPwd").value = password;
        updatePasswordStrength(password);
        showNotification("密码已生成", "success");
    });

    // 高级密码生成
    document.getElementById("advancedGenerate").addEventListener("click", showPasswordGenerator);

    // 密码强度检测
    document.getElementById("addPwd").addEventListener("input", (e) => {
        updatePasswordStrength(e.target.value);
    });

    // 清空表单
    document.getElementById("clearForm").addEventListener("click", clearForm);

    // 保存密码
    document.getElementById("submitAdd").addEventListener("click", () => {
        save().then(res => {
            showNotification("密码保存成功", "success");

            // 关闭当前窗口，关闭时会自动通知主窗口刷新
            setTimeout(() => {
                closeDialog();
            }, 800);
        }).catch(e => {
            showNotification(e, "error");
        });
    });

    // 模态框控制
    document.getElementById("closeModal").addEventListener("click", hidePasswordGenerator);
    document.getElementById("cancelGenerate").addEventListener("click", hidePasswordGenerator);
    document.getElementById("useGenerated").addEventListener("click", useGeneratedPassword);

    // 长度滑块
    document.getElementById("lengthSlider").addEventListener("input", (e) => {
        document.getElementById("lengthValue").textContent = e.target.value;
        generateModalPassword();
    });

    // 选项变化时重新生成
    const optionInputs = ["includeLowercase", "includeUppercase", "includeNumbers", "includeSymbols", "excludeSimilar"];
    optionInputs.forEach(id => {
        document.getElementById(id).addEventListener("change", generateModalPassword);
    });

    // 重新生成按钮
    document.getElementById("regenerate").addEventListener("click", generateModalPassword);

    // 复制生成的密码
    document.getElementById("copyGenerated").addEventListener("click", () => {
        const password = document.getElementById("generatedPassword").value;
        if (password) {
            program.send("copy", password).then(() => {
                showNotification("密码已复制", "success");
            }).catch(err => {
                showNotification("复制失败: " + err, "error");
            });
        }
    });

    // 点击模态框背景关闭
    document.getElementById("passwordGeneratorModal").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
            hidePasswordGenerator();
        }
    });

    // 键盘快捷键
    document.addEventListener("keydown", (e) => {
        // ESC 关闭模态框或窗口
        if (e.key === "Escape") {
            if (document.getElementById("passwordGeneratorModal").style.display === "flex") {
                hidePasswordGenerator();
            } else {
                closeDialog();
            }
        }
        // Ctrl+S 保存
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            document.getElementById("submitAdd").click();
        }
        // Ctrl+G 生成密码
        if (e.ctrlKey && e.key === "g") {
            e.preventDefault();
            document.getElementById("generatePwd").click();
        }
    });

    // 聚焦到第一个输入框
    document.getElementById("addName").focus();
};
