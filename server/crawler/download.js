const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
module.exports = function() {
    return {
        downloadImage: function(url, targetDir, fileName) {

            axios({
                method: 'get',
                url: url,
                responseType: 'stream'
            }).then((res) => {
                res.data.pipe(fs.createWriteStream(`${targetDir}/${fileName}`));
                console.log(`download ${targetDir}/${fileName}`);
            }).catch((err) => {
                console.log(err);
            })
        }
    };
};
