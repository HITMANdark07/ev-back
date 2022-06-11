const  AWS = require('aws-sdk');
const fs = require("fs");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

  
exports.s3upload = (filePath,filename,mimetype) => {

    return new Promise((resolve, reject) => {
        const fileContent = fs.readFileSync(filePath);
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${filename}.${mimetype.split("/")[1]}`,
                Body: fileContent,
                ContentType :mimetype,
                ACL: "public-read",
            }
            s3.upload(params, (err, data) => {
                if (err) {
                  reject(err);
                }
                resolve(data.Location);
            })
        
    })
}