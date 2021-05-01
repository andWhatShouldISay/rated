const Discord = require('discord.js');
const client = new Discord.Client();
const https = require('https');


var exec = require('child_process').exec, child;
var fs = require('fs');
var Clipper = require('image-clipper');
Clipper.configure('canvas', require('canvas'));
PNG = require("pngjs").PNG;


client.on('ready', () => {
    console.log('I am ready!');
});


var valid_ = "1234567890-._qwertyuiopasdfghjklzxcvbnmQAZWSXEDCRFVTGBYHNUJMIKOLP"

function valid(x) {
    for (var j = 0; j < valid_.length; j++) {
        if (valid_[j] == x) {
            return true
        }
    }
    return false
}

function valid_s(s) {
    for (var i = 0; i < s.length; i++) {
        if (!valid(s[i])) {
            return false
        }
    }
    return true
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

var working = 0

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    return stats.size;
}

function makeid(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}


function work(user, number, message) {
    if (user.toLowerCase() == "vammadur") {
        message.channel.send("stupid vammadur he's unfetchable")
        return
    }
    if (user.toLowerCase() == "1-gon" && number >= 100 && number < 200) {
        message.channel.send("1-gay lol")
        return
    }
    if (user.toLowerCase() == "askd") {
        message.channel.send("ask askd not to send too much barack obamas")
        return
    }
    if (working >= 4) {
        message.channel.send("wait please i'm doing another requests")
        return
    }
    working += 1

    //message.channel.send("searchin for user " + user)
    //sending an http request to check whether a user exists in codeforces
    https.get('https://codeforces.com/api/user.info?handles=' + user, (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            var status = JSON.parse(data).status
            console.log(status)

            if (status === "OK") {
                // a path to save the image
                let imgpath = 'pics/' + makeid(5) + ".png"
                //message.channel.send("getting the image of webpage with comments")
                // running a command line command "wkhtmltoimage"
                var address = "https://codeforces.com/comments/with/" + user + "/page/" + (1 + Math.floor(number / 100)) + "/?locale=ru"
                child = exec("wkhtmltoimage " + address + " " + imgpath,
                    function (error, stdout, stderr) {
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                        if (error !== null) {
                            console.log('exec error: ' + error);
                            working -= 1
                        } else {
                            var sz = getFilesizeInBytes(imgpath)
                            console.log("size: ", sz)
                            let height = Math.round(sz / 1200 / 4)
                            if (height > 32400) // can't handle long images
                                height = 32400
                            console.log("height: " + height)
                            Clipper(imgpath, function () {
                                //cutting the image keeping only the comments section and site top
                                this.crop(20, 0, 880, height)
                                    .toFile(imgpath, function () {
                                        console.log('saved!');
                                        fs.createReadStream(imgpath)
                                            .pipe(
                                                new PNG({
                                                    filterType: 4,
                                                })
                                            )
                                            .on("parsed", function () {
                                                //message.channel.send("cutting the image to get the comment")

                                                var x = -1

                                                // searching for the beginnings of the comments
                                                // i mean searching for [194,194,194] pixels because letter Н in the word На has this colour
                                                // and for [204,204,204] because the line in the end has this colour
                                                function clr(obj, Y, x) {
                                                    var idx = (obj.width * Y + x) << 2;
                                                    return [obj.data[idx], obj.data[idx + 1], obj.data[idx + 2], obj.data[idx + 3]]
                                                }

                                                /*for (var q = -1; q <= 1; q++) {
                                                    for (var w = -1; w <= 1; w++) {
                                                        console.log(q,w,clr(this, 283+q,157+w))
                                                    }
                                                }*/


                                                function white(y, x, obj) {
                                                    var C = clr(obj, y, x)
                                                    return C[0] >= 220 && C[1] >= 220 && C[2] >= 220
                                                }

                                                function grey(y, x, obj) {
                                                    var C = clr(obj, y, x)
                                                    return !white(y, x, obj) && C[0] >= 180 && C[1] >= 180 && C[2] >= 180
                                                }

                                                var tops = []

                                                function hhh(y2, X, obj) {
                                                    return white(y2 - 1, X - 1, obj) && grey(y2 - 1, X, obj) && white(y2 - 1, X + 1, obj) &&
                                                        grey(y2, X - 1, obj) && grey(y2, X, obj) && white(y2, X + 1, obj) &&
                                                        white(y2 + 1, X - 1, obj) && grey(y2 + 1, X, obj) && white(y2 + 1, X + 1, obj)

                                                }

                                                for (var y2 = 283; y2 <= height; y2++) {
                                                    for (var X = 2; X < 1150; X++) {
                                                        if (hhh(y2, X, this)) {
                                                            tops.push(y2)
                                                            break
                                                        }
                                                    }
                                                    if (tops.length > 0) {
                                                        x = X
                                                        tops = []
                                                        break
                                                    }
                                                }

                                                for (var XX = x; XX <= x; XX++) {
                                                    for (var yy2 = 2; yy2 < height; yy2++) {
                                                        if (hhh(yy2, XX, this)) {
                                                            tops.push(yy2)
                                                        }
                                                    }
                                                }


                                                for (var y = height - 10; y > 0; y--) {
                                                    var c = clr(this, y, x)
                                                    if (c.reduce((a, b) => a + b, 0) !== 255 * 4) {
                                                        if (c[0] === 204 && c[1] === 204 && c[2] === 204 && arraysEqual(c, clr(this, y, x - 1)) && arraysEqual(c, clr(this, y, x - 2))) {
                                                            tops.push(y)
                                                            console.log("line: ", y)
                                                            break
                                                        }
                                                    }
                                                }

                                                console.log("tops: ", tops[0], tops.length)

                                                number %= 100

                                                if (tops.length > 1 && number + 1 < tops.length) {
                                                    if (clr(this, tops[number + 1], x)[0] === 204) {
                                                        var ypfp = tops[number + 1] - 1
                                                        while (arraysEqual([255, 255, 255, 255], clr(this, ypfp, 54))) {
                                                            ypfp -= 1
                                                        }
                                                        console.log("ypfp: ", ypfp)
                                                        tops[number + 1] = tops[number + 0] + 2 * (ypfp - tops[number + 0])
                                                    }
                                                    Clipper(imgpath, function () {
                                                        // cutting image to comment
                                                        this.crop(0, tops[number + 0] - 27, 879, tops[number + 1] - tops[number + 0])
                                                            .toFile(imgpath, function () {
                                                                message.channel.send({files: [imgpath]}).then(() =>
                                                                    // deleting image from my computer
                                                                    fs.unlink(imgpath, function (err) {
                                                                        console.log("deleting")
                                                                        if (err != null) {
                                                                            console.log(err)
                                                                        }
                                                                        working -= 1
                                                                    }));
                                                            });
                                                    })
                                                } else {
                                                    message.channel.send("can't find " + user + "'s comments")
                                                    working -= 1
                                                }
                                                ;
                                            });
                                    });
                            });
                        }
                    })
            } else {
                message.channel.send(JSON.parse(data).comment)
                working -= 1
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });


}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function slash(s) {
    for (i = 0; i < s.length; i++) {
        if (isLetter(s[i])) {
            return s.substr(0, i) + '/problem/' + s.substr(i)
        }
    }
    return s
}

// Create an event listener for messages
client.on('message', message => {
    try {
	    if (message.author.bot) return;

	    if (message.content.toLowerCase() === "is it rated?") {
		work("dxymaster2002", getRandomInt(59), message)
	    }

	    let arr = message.content.split(' ')
	    if (arr[0].toLowerCase() === 'komments') {
		if (arr.length === 2 && valid_s(arr[1])) {
		    work(arr[1], 0, message)
		} else if (arr.length === 3 && valid_s(arr[1]) && !isNaN(arr[2]) && (+arr[2]) >= 0 && !arr[2].includes('.') && !arr[2].includes('-')) {
		    work(arr[1], +arr[2], message)
		} else {
		    message.channel.send("your query is stupid, use ```komments username [nonnegative integer]```")
		}
	    }
	    
	    if (arr[0].toLowerCase() === "statements") {
	    arr[1] = arr[1].toUpperCase()
	    
	    if (arr[0].toLowerCase() === "statements" && !(problems[arr[1]] === 1) && !(contests[arr[1]] === 1) && !(problems[arr[1]] === 2)) {
	    	message.reply("invalid index or contest id")
	    }

	    if (arr[0].toLowerCase() === "statements" && problems[arr[1]] === 2) {
	    	message.reply(arr[1]+" is a bad problem lol")
	    }
	    if (arr[0].toLowerCase() === "statements" && problems[arr[1]] === 1) {
		let imgpath = 'pics/' + makeid(5) + ".png"
		//message.channel.send("getting the image of webpage with comments")
		// running a command line command "wkhtmltoimage"
		
		var locale = "en"
		if (arr[2] === "ярусский") locale = "ru"
		
		var address = "https://codeforces.com/contest/" + slash(arr[1]) + "?locale=" + locale
		child = exec("wkhtmltoimage " + address + " " + imgpath,
		    function (error, stdout, stderr) {
		        console.log('stdout: ' + stdout);
		        console.log('stderr: ' + stderr);
		        if (error !== null) {
		            console.log('exec error: ' + error);
		        } else {
		            fs.createReadStream(imgpath)
		                .pipe(
		                    new PNG({
		                        filterType: 4,
		                    })
		                )
		                .on("parsed", function () {
		                    console.log("sz: ", this.width, this.height)
		                    var w = this.width, h = this.height
		                    Clipper(imgpath, function () {
		                        //cutting the image keeping only the comments section and site top
		                        this.crop(0,185,920, h-430)
		                            .toFile(imgpath, function () {
		                                message.channel.send({files: [imgpath]}).then(() =>
		                                    // deleting image from my computer
		                                    fs.unlink(imgpath, function (err) {
		                                        console.log("deleting")
		                                        if (err != null) {
		                                            console.log(err)
		                                        }
		                                    }));
		                            })
		                    })
		                })
		        }
		    }
		)
	    }
	    
	    if (arr[0].toLowerCase() === "statements" && contests[arr[1]] === 1) {
		let imgpath = 'pics/' + makeid(5) + ".pdf"
		//message.channel.send("getting the image of webpage with comments")
		// running a command line command "wkhtmltoimage"
		
		var locale = "en"
		if (arr[2] === "ярусский") locale = "ru"
		
		var address = "https://codeforces.com/contest/" + arr[1] + "/problems?locale=" + locale
		child = exec("wkhtmltopdf " + address + " " + imgpath,
		    function (error, stdout, stderr) {
		        console.log('stdout: ' + stdout);
		        console.log('stderr: ' + stderr);
		        if (error !== null) {
		            console.log('exec error: ' + error);
		        } else {
		                message.channel.send({files: [imgpath]}).then(() =>
		                    // deleting image from my computer
		                    fs.unlink(imgpath, function (err) {
		                        console.log("deleting")
		                        if (err != null) {
		                            console.log(err)
		                        }
		                    }));
		        }
		    }
		)
	    }
	    }

	    if (message.content.toLowerCase() === "new problems") get_problems()
	    
	    if (message.content.toLowerCase().includes("spam") && Math.random() < 0.25) {
		    message.channel.send({files:['rick.gif']})
	    }
	    
     } catch (e) {
            console.log("EXCEPTION " + e)
     }
});
get_problems()
function get_problems(){
	https.get(' https://codeforces.com/api/problemset.problems', (resp) => {
	    let data = '';

	    // A chunk of data has been received.
	    resp.on('data', (chunk) => {
		data += chunk;
	    });

	    // The whole response has been received. Print out the result.
	    resp.on('end', () => {
		var obj = JSON.parse(data)
		problems = {}
		contests = {}
		for (var i = 0; i < obj.result.problems.length; i++) {
		    problems[obj.result.problems[i].contestId + obj.result.problems[i].index] = 1
		    contests[obj.result.problems[i].contestId] = 1
		}
		problems['1441F'] = 1
		problems['528E'] = 2
		console.log("parsed problems indexes")
	    })
	})
}
// Log our bot in using the token from https://discord.com/developers/applications
client.login(require('./auth.json').token);

