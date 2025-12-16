window.onload = ()=>{
    let program = initProgram();

    // 关闭按钮
    document.getElementById("close").addEventListener("click",()=>{
        program.message("close")
    });

    // 密码可见性切换
    document.getElementById("toggleSecret").addEventListener("click", ()=>{
        const secretInput = document.getElementById("secret");
        const eyeIcon = document.querySelector(".eye-icon");

        if (secretInput.type === "password") {
            secretInput.type = "text";
            eyeIcon.textContent = "🙈";
        } else {
            secretInput.type = "password";
            eyeIcon.textContent = "👁";
        }
    });

    // 提交按钮
    document.getElementById("submit").addEventListener("click",()=>{
        const submitBtn = document.getElementById("submit");
        const btnText = document.querySelector(".btn-text");
        const btnIcon = document.querySelector(".btn-icon");

        let secret = document.getElementById("secret").value.trim();

        // 输入验证
        if (!secret) {
            showError("请输入主密钥");
            return;
        }

        // 显示加载状态
        submitBtn.disabled = true;
        btnText.textContent = "验证中...";
        btnIcon.textContent = "⏳";

        program.message("submit",{
            secret,
            remember: false  // 始终不记住密钥
        });
    });

    // 回车键提交
    document.getElementById("secret").addEventListener("keydown", (e)=>{
        if (e.key === "Enter") {
            document.getElementById("submit").click();
        }
    });

    // 自动聚焦到密钥输入框
    document.getElementById("secret").focus();
};

// 显示错误提示
function showError(message) {
    const secretInput = document.getElementById("secret");

    // 添加错误样式
    secretInput.style.borderColor = "#f44336";
    secretInput.style.boxShadow = "0 0 0 3px rgba(244, 67, 54, 0.1)";

    // 创建错误提示
    let errorDiv = document.querySelector(".error-message");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.style.cssText = `
            color: #f44336;
            font-size: 12px;
            margin-top: 6px;
            animation: shake 0.5s ease-in-out;
        `;
        secretInput.parentNode.appendChild(errorDiv);
    }

    errorDiv.textContent = message;

    // 添加摇晃动画
    const style = document.createElement("style");
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);

    // 3秒后清除错误状态
    setTimeout(() => {
        secretInput.style.borderColor = "";
        secretInput.style.boxShadow = "";
        if (errorDiv) {
            errorDiv.remove();
        }
    }, 3000);
}
