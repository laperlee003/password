const { createApp, nextTick } = require("vue");

window.onload = () => {
    createApp({
        data() {
            return {
                program: null,
                secret: "",
                secretVisible: false,
                submitting: false,
                errorMessage: "",
                errorTimer: null
            };
        },
        computed: {
            secretInputType() {
                return this.secretVisible ? "text" : "password";
            },
            eyeIcon() {
                return this.secretVisible ? "🙈" : "👁";
            },
            submitText() {
                return this.submitting ? "验证中..." : "解锁密码管理器";
            },
            submitIcon() {
                return this.submitting ? "⏳" : "→";
            }
        },
        mounted() {
            this.program = initProgram();

            nextTick(() => {
                this.$refs.secretInput && this.$refs.secretInput.focus();
            });
        },
        beforeUnmount() {
            if (this.errorTimer) {
                clearTimeout(this.errorTimer);
            }
        },
        methods: {
            closeWindow() {
                this.program.message("close");
            },
            toggleSecretVisibility() {
                this.secretVisible = !this.secretVisible;
            },
            submit() {
                if (this.submitting) {
                    return;
                }

                if (!this.secret) {
                    this.showError("请输入主密钥");
                    return;
                }

                this.submitting = true;
                this.program.message("submit", {
                    secret: this.secret,
                    remember: false
                });
            },
            showError(message) {
                this.errorMessage = message;

                if (this.errorTimer) {
                    clearTimeout(this.errorTimer);
                }

                this.errorTimer = setTimeout(() => {
                    this.errorMessage = "";
                    this.errorTimer = null;
                }, 3000);
            }
        }
    }).mount("#app");
};
