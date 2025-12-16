let init = require("./init");
init("application");


// class StringEncodeDecode{
//     constructor(key){
//         this.key=key;
//     }

//     encode(string){
//         return this.base64(this.binary2Str(this.encodeBinary(this.str2binary(string),this.key)));
//     }

//     decode(string){
//         return this.binary2Str(this.encodeBinary(this.str2binary(this.unbase64(string)),this.key));
//     }

    
//     str2binary(str){
//         var result = [];
//         var list = str.split("");
//         for(var i=0;i<list.length;i++){
//             if(i != 0){
//                 result.push(" ");
//             }
//             var item = list[i];
//             var binaryStr = item.charCodeAt().toString(2);
//             result.push(binaryStr);
//         }
//         return result.join("");
//     }
//     binary2Str(binary){
//         var result = [];
//         var list = binary.split(" ");
//         for(var i=0;i<list.length;i++){
//             var item = list[i];
//             var asciiCode = parseInt(item,2);
//             var charValue = String.fromCharCode(asciiCode);
//             result.push(charValue);
//         }
//         return result.join("");
//     }

//     encodeBinary(binary,key){
//         let binarys = binary.split("");
//         let keyBinary = this.str2binary(key);
//         keyBinary=keyBinary.replace(/ /g,"");
//         let skip=true;
//         for(let i in binarys){
//             if(skip){
//                 skip=false;
//                 continue;
//             }
//             if(binarys[i]=="1" || binarys[i]=="0"){
//                 let key = keyBinary.substr((i%keyBinary.length),1);
//                 if(key=="1"){
//                     binarys[i]=(binarys[i]=="1" ? "0" : "1");
//                 }
//             }else{  //空格位
//                 skip=true;
//             }
//         }
//         let encodeBinary = binarys.join("");
//         return encodeBinary;
//     }
    
//     base64(string){
//         return Buffer.from(string,"utf-8").toString("base64");
//     }
//     unbase64(string){
//         return Buffer.from(string,"base64").toString("utf-8");
//     }

// }

// let encodeDecodeObj = new StringEncodeDecode("laperlee");
// let encodeStr = encodeDecodeObj.encode("my name is lapeerlee");
// let decodeStr = encodeDecodeObj.decode(encodeStr);
// console.log(encodeStr);
// console.log(decodeStr);



// let fs = require("fs");

// let buffer = new ArrayBuffer(2)
// let view = new DataView(buffer);
// view[0] = "33"
// view[1] = "88"

// fs.writeFileSync("./lll",view);
