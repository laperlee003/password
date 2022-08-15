window.onload = ()=>{
    let program = initProgram();
    document.getElementById("close").addEventListener("click",()=>{
        program.message("close")
    });

    document.getElementById("submit").addEventListener("click",()=>{
        let secret = document.getElementById("secret").value;
        let remember = document.getElementById("remember").checked
        program.message("submit",{
            secret,
            remember
        })
    });

}
