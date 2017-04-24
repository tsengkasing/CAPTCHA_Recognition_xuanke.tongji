var http = require('http');
var fs = require("fs");
var sleep = require('thread-sleep');

const counts = 100;

function run(i) {
	const opts = {
        hostname: "xuanke.tongji.edu.cn",
        path: "/CheckImage",
        method: 'GET',
        port: 80,
        headers: {
            'Accept':'image/webp,image/*,*/*;q=0.8',
			'Accept-Encoding':'gzip, deflate, sdch',
			'Accept-Language':'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
			'Cache-Control':'no-cache',
			'Connection':'keep-alive',
			'Cookie':'yunsuo_session_verify=5405136ec66b2fdd9866f9fb72b8804f; JSESSIONID=00003VcU3lwTPmM1OkYmTVQOHn8:-1',
			'DNT':1,
			'Host':'xuanke.tongji.edu.cn',
			'Pragma':'no-cache',
			'Referer':'http://xuanke.tongji.edu.cn/',
			'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
        }
    };

    var req = http.request(opts, function(_res) {
        let info = [];
        _res.on('data', (chunk) => { 
        	info.push(chunk);
        });
        _res.on('end', () => {
        	if(!info) return;
        	info = Buffer.concat(info);
        	fs.writeFile(`./xuanke_code/code_${i}.jpg`, info, {flag: 'w'}, function (err) {
			   if(err) {
			    	console.error(err);
			    } else {
			       console.log(`[INFO] Save File code_${i}.jpg`);
			       if(i < counts) {
			       	    // sleep(3000);
						run(i + 1);
			       }
			       	
			    }
			});

        });
    });

    req.on('error', (e) => {
        console.log(`请求遇到问题: ${e.message}`);
    });

    req.end();
}

run(11);