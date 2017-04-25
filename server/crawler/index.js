const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const download = require('./download')();
const _ = require('lodash');
const URL = require('url').URL;
const Path = require('path');
const Promise = require('bluebird');
const baseUrl = 'http://www.juemei.com';
let groupPage = ['/mm/xinggan/index_2.html'];
let groups = [];
let images = [];
begin();

function start() {
    let url = 'http://www.juemei.com/mm/201704/8742.html';
    axios.get(url)
        .then((res) => {
            const $ = cheerio.load(res.data);
            let imgUrl = $('.wrap img').attr('src');
            let page = $('.page .end').text();
            let urls = [];
            let baseUrl = url.replace('.html', '');
            for (let i = 2; i <= page; i++) {
                urls.push(`${baseUrl}_${i}.html`);
            }
            return urls;
        }).then((results) => {
            return promise.mapSeries(results, (item, index) => {
                return axios.get(item)
                    .then((res) => {
                        const $ = cheerio.load(res.data);
                        let imgUrl = $('.wrap img').attr('src');
                        download.downloadImage(imgUrl, '/ss', Path.basename(imgUrl));
                    }).catch((err) => {
                        console.log(err);
                    })
            })
        })
        .catch((err) => {
            console.log(err.message);
        });

}


let level1Pages = [];

function getLevel1Pages(url) {
    return axios.get(url)
        .then((res) => {
            const $ = cheerio.load(res.data);
            const maxPage = $('.page .end').text();
            const maxPageUrl = $('.page .end').attr('href');
            const tplPageUrl = maxPageUrl.replace(`_${maxPage}.html`, '');
            level1Pages = [];
            level1Pages.push(url);

            for (let i = 2; i <= maxPage; ++i) {
                level1Pages.push(`${baseUrl}${tplPageUrl}_${i}.html`);
            }
            return level1Pages;
        })
}
let level2Pages = [];

function getLevel2Pages(url) {
    return axios.get(url)
        .then((res) => {
            const $ = cheerio.load(res.data);
            level2Pages = [];
            $('#waterfall a').each((index, item) => {
                const url = $(item).attr('href');
                level2Pages.push(`${baseUrl}${url}`);
            })
            return level2Pages;
        })
}
let level3Pages = [];

function getLevel3Pages(url) {
    return axios.get(url)
        .then((res) => {
            const $ = cheerio.load(res.data);
            level3Pages = [];
            level3Pages.push(url);
            const title = $('h1').text();
            fs.mkdir(title, (err) => {
                console.log(err);
            });
            let maxPage = $('.page .end').text();
            if (_.isNull(maxPage)) {
                maxPage = $('.page .next').prev().text();
            }

            for (let i = 2; i <= maxPage; ++i) {
                level3Pages.push(url.replace('.html', `_${i}.html`));
            }
            return {
                level3Pages: level3Pages,
                title: title
            };
        })
}

function getLevel4Page(url) {
    return axios.get(url)
        .then((res) => {
            const $ = cheerio.load(res.data);
            const imgUrl = $('.wrap img').attr('src');
            return imgUrl;
        }).catch((err) => {
            console.log(err.message);
            return Promise.reject(`get single img failed`);
        })
}

function begin() {
    getLevel1Pages('http://www.juemei.com/mm/xinggan/').then((result) => {
        //console.log(result)
        return getLevel2Pages(result[0]);
    }).then((result) => {
        return Promise.mapSeries(result, (item, index) => {
            return getLevel3Pages(item)
                .then((result) => {
                    let title = result.title;
                    return Promise.mapSeries(result.level3Pages, (item, index) => {
                        return getLevel4Page(item)
                            .then((result) => {
                                return download.downloadImage(result, `${title}`, `${index}.jpg`);
                            });
                    })
                })
        });
    }).then((result) => {
        console.log(result);
    })
}
