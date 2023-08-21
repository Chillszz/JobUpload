console.log('popup.js is running');

chrome.runtime.onMessage.addListener(//listener for every script that send message
  function(request) {
    if (request.main === "done") {
        document.getElementById('Job').value = "";
        document.getElementById('SubmitLink').disabled = "";
        document.getElementById('Job').disabled = "";
        document.getElementById('SubmitLink').innerText = "Done!";
        setTimeout(() => {
            document.getElementById('SubmitLink').innerText = "Submit";
        }, 2000);
    }
  });

document.getElementById('SubmitLink').addEventListener('click', () => { // submit the link provided by the user
    if(document.getElementById('Job').value) {
        //detect if theres any Openrole page open
        chrome.tabs.query({
            'url': 'https://app.openrole.ai/*'
            }, function(tabs) {
                if (tabs.length > 0) {
                    // if the tab exist, execute the code to transfer the data
                    if(document.getElementById('Job').value.includes('linkedin')) {
                        EnteredURLlinkedin(document.getElementById('Job').value);
                        document.getElementById('SubmitLink').innerText = "Creating...";
                        document.getElementById('SubmitLink').disabled = "true";
                        document.getElementById('Job').disabled = "true";
                    } else if(document.getElementById('Job').value.includes('indeed')) {
                        EnteredURLindeed(document.getElementById('Job').value);
                        document.getElementById('SubmitLink').innerText = "Creating...";
                        document.getElementById('SubmitLink').disabled = "true";
                        document.getElementById('Job').disabled = "true";
                    } else {
                        document.getElementById('SubmitLink').innerText = "Unsupported Link";
                    }
                    
                } else {
                    // this alert the user to make sure that they have the Openrole page open so it can transfer the data
                    alert('Please open Openrole Page and login')
                    chrome.tabs.create({
                    'url': 'https://app.openrole.ai/saved',
                    active: false
                    });
                }
            });
    } else {
        // if the url is empty or user havent input any link it will warn them to input a workin link
        document.getElementById('Job').placeholder = "Please enter url"
    }

})

function EnteredURLlinkedin(uURL) {
    // this function starts up by scraping the URL provided (Linkedin.com)
    let found= false,done = false;
    fetch(`${uURL}`, {
        "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9,fil;q=0.8",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    }).then(resp => resp.text())
    .then(resp => {
        const parser = new DOMParser();
        const tempel = parser.parseFromString(resp, 'text/html');
        tempel.querySelectorAll('code').forEach((item,index1,array1) => {
            if(item.innerText.includes('"companyDetails":{"company"')){
                console.log(JSON.parse(item.innerText))
                let Jdata = JSON.parse(item.innerText);
                fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${Jdata.included[1].name.split(' ').join('%20')}`, {
                    "headers": {
                    "accept": "application/json, text/plain, */*",
                    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\""
                    },
                    "referrerPolicy": "same-origin",
                    "body": null,
                    "method": "GET",
                    "mode": "cors",
                    "credentials": "omit"
                }).then(resp2 => resp2.json())
                .then(resp2 => {
                    console.log(resp2)
                    if(resp2.length >= 1) {
                        resp2.forEach((urlitem,index,array) => {
                            console.log(urlitem.name + " | " + Jdata.included[1].name)
                            if(urlitem.name === Jdata.included[1].name && !done) {
                                chrome.storage.local.set({
                                    'url' : uURL,
                                    'name' : urlitem.name,
                                    'logo': urlitem.logo,
                                    'domain': urlitem.domain,
                                    'title': Jdata.data.title,
                                    'desc' : Jdata.data.description.text,
                                    'status': document.getElementById('StatusSelection').value
                                })
                                sendlinkedin();
                                done = true;
                                found = true;
                            }
                             if(index === array.length - 1 && !done){
                                chrome.storage.local.set({
                                    'url' : uURL,
                                    'name' : Jdata.included[1].name,
                                    'logo': `https://logo.clearbit.com/q=${Jdata.included[1].name.split(' ').join('%20')}`,
                                    'domain': `https://logo.clearbit.com/q=${Jdata.included[1].name}`,
                                    'title': Jdata.data.title,
                                    'desc' : Jdata.data.description.text,
                                    'status': document.getElementById('StatusSelection').value
                                })
                                sendlinkedin();
                                found = true;
                                done = true;
                            }

                            if(index === array.length - 1 && !found) {
                                document.getElementById('SubmitLink').innerText = "Error";
                                document.getElementById('Job').value = "";
                                document.getElementById('Job').placeholder = "Try again"
                                document.getElementById('SubmitLink').disabled = "";
                                document.getElementById('Job').disabled = "";
                                setTimeout(() => {
                                    document.getElementById('SubmitLink').innerText = "Submit";
                                }, 2000);
                            }
                        })
                    } else if(resp2.length == 0){
                        chrome.storage.local.set({
                            'url' : uURL,
                            'name' : Jdata.included[1].name,
                            'logo': `https://logo.clearbit.com/q=${Jdata.included[1].name.split(' ').join('%20')}`,
                            'domain': `https://logo.clearbit.com/q=${Jdata.included[1].name}`,
                            'title': Jdata.data.title,
                            'desc' : Jdata.data.description.text,
                            'status': document.getElementById('StatusSelection').value
                        })
                        sendlinkedin();
                        found = true;
                    }
                })
            }
            setTimeout(() => {
                if((index1 === array1.length - 1) && (!found)) {
                    document.getElementById('SubmitLink').innerText = "Error";
                    document.getElementById('Job').value = "";
                    document.getElementById('Job').placeholder = "Try again";
                    document.getElementById('SubmitLink').disabled = "";
                    document.getElementById('Job').disabled = "";
                    setTimeout(() => {
                        document.getElementById('SubmitLink').innerText = "Submit";
                    }, 2000);
                }
            },5000)
        })

    })
}

function EnteredURLindeed(uURL) {
    let found= false,done = false;
    fetch(`${uURL}`, {
        "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9,fil;q=0.8",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    }).then(resp => resp.text())
    .then(resp => {
        const parser = new DOMParser();
        const tempel = parser.parseFromString(resp, 'text/html');
        fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${tempel.querySelector('meta[property="og:description"]').getAttribute('content')}`, {
            "headers": {
            "accept": "application/json, text/plain, */*",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\""
            },
            "referrerPolicy": "same-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        }).then(resp2 => resp2.json())
        .then(resp2 => {
            console.log(resp2)
            if(resp2.length >= 1) {
                resp2.forEach((urlitem,index,array) => {
                    console.log(urlitem.name + " | " + tempel.querySelector('meta[property="og:description"]').getAttribute('content'))
                    if(urlitem.name === tempel.querySelector('meta[property="og:description"]').getAttribute('content') && !done) {
                        chrome.storage.local.set({
                            'url' : uURL,
                            'name' : urlitem.name,
                            'logo': urlitem.logo,
                            'domain': urlitem.domain,
                            'title': tempel.querySelector('meta[property="og:title"]').getAttribute('content'),
                            'desc' : tempel.querySelector('div#jobDescriptionText').innerHTML,
                            'status': document.getElementById('StatusSelection').value
                        })
                        sendindeed();
                        done = true;
                        found = true;
                    }
                     if(index === array.length - 1 && !done){
                        chrome.storage.local.set({
                            'url' : uURL,
                            'name' : tempel.querySelector('meta[property="og:description"]').getAttribute('content'),
                            'logo': `https://logo.clearbit.com/q=${tempel.querySelector('meta[property="og:description"]').getAttribute('content').split(',')[0].split(' ').join('%20')}`,
                            'domain': `https://logo.clearbit.com/q=${tempel.querySelector('meta[property="og:description"]').getAttribute('content')}`,
                            'title': tempel.querySelector('meta[property="og:title"]').getAttribute('content'),
                            'desc' : tempel.querySelector('div#jobDescriptionText').innerHTML,
                            'status': document.getElementById('StatusSelection').value
                        })
                        sendindeed();
                        found = true;
                        done = true;
                    }

                    if(index === array.length - 1 && !found) {
                        document.getElementById('SubmitLink').innerText = "Error";
                        document.getElementById('Job').value = "";
                        document.getElementById('Job').placeholder = "Try again"
                        document.getElementById('SubmitLink').disabled = "";
                        document.getElementById('Job').disabled = "";
                        setTimeout(() => {
                            document.getElementById('SubmitLink').innerText = "Submit";
                        }, 2000);
                    }
                })
            } else if(resp2.length == 0) {
                chrome.storage.local.set({
                    'url' : uURL,
                    'name' : tempel.querySelector('meta[property="og:description"]').getAttribute('content'),
                    'logo': `https://logo.clearbit.com/q=${tempel.querySelector('meta[property="og:description"]').getAttribute('content').split(',')[0].split(' ').join('%20')}`,
                    'domain': `https://logo.clearbit.com/q=${tempel.querySelector('meta[property="og:description"]').getAttribute('content')}`,
                    'title': tempel.querySelector('meta[property="og:title"]').getAttribute('content'),
                    'desc' : tempel.querySelector('div#jobDescriptionText').innerHTML,
                    'status': document.getElementById('StatusSelection').value
                })
                sendindeed();
                found = true;
            }
        })
    }).catch(err =>{
        document.getElementById('SubmitLink').innerText = "Error";
        document.getElementById('Job').value = "";
        document.getElementById('Job').placeholder = "Please check the cloudflare safety check"
        document.getElementById('SubmitLink').disabled = "";
        document.getElementById('Job').disabled = "";
        setTimeout(() => {
            document.getElementById('SubmitLink').innerText = "Submit";
        }, 2000);
    })
}


function sendlinkedin() {
    function code()
    {
        chrome.storage.local.get(['url','name','logo','domain','title','desc','status'], (result) => {
            fetch("https://app.openrole.ai/api/v1/saved", {
                "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9,fil;q=0.8",
                "content-type": "application/json",
                "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrftoken": `${getCookie('csrftoken')}`
                },
                "referrerPolicy": "same-origin",
                "body": `{\"stageDate\":\"${new Date().toISOString()}\",\"company\":{\"name\":\"${result.name.split(',')[0]}\",\"logo\":\"${result.logo}\",\"domain\":\"${result.domain}\"},\"title\":\"${result.title}\",\"stage\":\"${result.status}\",\"url\":\"${result.url}\"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(resp => resp.json())
            .then(resp => {
                chrome.storage.local.set({
                    'url' : "",
                    'name' : "",
                    'logo': "",
                    'domain': "",
                    'title': ""
                })
                console.log(resp)
                console.log(resp.id)
                console.log(result.desc)
                fetch(`https://app.openrole.ai/api/v1/saved/${resp.id}/`, {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-US,en;q=0.9,fil;q=0.8",
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-csrftoken": `${getCookie('csrftoken')}`
                },
                "referrerPolicy": "same-origin",
                "body": `{\"description\":\"<p>${result.desc.split('\n').join('</p><br><p>').split('"').join('&quot;')}</p>\"}`,
                "method": "PATCH",
                "mode": "cors",
                "credentials": "include"
                }).then(resp => {
                    if(resp.ok) {
                        location.reload();
                        chrome.runtime.sendMessage({
                            main : 'done'
                        },() => {})
                    }
                })
            })
        })
        function getCookie(cookieName) {
            var name = cookieName + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if ((c.indexOf(name)) == 0) {
                    return c.substr(name.length);
                }
        
            }
            alert("not found");
            return null;
        }
    }
    chrome.tabs.query({
        'url': 'https://app.openrole.ai/*'
    }, function(tabs) {
        chrome.scripting.executeScript({
        target: {
            tabId: tabs[0].id,
            allFrames: true
        },
        func: code
        });
    });
}

function sendindeed() {
    function code()
    {
        chrome.storage.local.get(['url','name','logo','domain','title','desc','status'], (result) => {
            let regex = /(div|h1|h2|h3)/g
            fetch("https://app.openrole.ai/api/v1/saved", {
                "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9,fil;q=0.8",
                "content-type": "application/json",
                "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrftoken": `${getCookie('csrftoken')}`
                },
                "referrerPolicy": "same-origin",
                "body": `{\"stageDate\":\"${new Date().toISOString()}\",\"company\":{\"name\":\"${result.name.split(',')[0]}\",\"logo\":\"${result.logo}\",\"domain\":\"${result.domain}\"},\"title\":\"${result.title}\",\"stage\":\"${result.status}\",\"url\":\"${result.url}\"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(resp => resp.json())
            .then(resp => {
                chrome.storage.local.set({
                    'url' : "",
                    'name' : "",
                    'logo': "",
                    'domain': "",
                    'title': ""
                })
                console.log(resp)
                console.log(resp.id)
                console.log(result.desc)
                fetch(`https://app.openrole.ai/api/v1/saved/${resp.id}/`, {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-US,en;q=0.9,fil;q=0.8",
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-csrftoken": `${getCookie('csrftoken')}`
                },
                "referrerPolicy": "same-origin",
                "body": `{\"description\":\"${result.desc.split('\n').join('').replaceAll(regex,'p').replace('class="jobSectionHeader"',"").replaceAll(/(  |class="jobSectionHeader")/g,"")}\"}`,
                "method": "PATCH",
                "mode": "cors",
                "credentials": "include"
                }).then(resp => {
                    if(resp.ok) {
                        location.reload();
                        chrome.runtime.sendMessage({
                            main : 'done'
                        },() => {})
                    }
                })
            })
        })
        function getCookie(cookieName) {
            var name = cookieName + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if ((c.indexOf(name)) == 0) {
                    return c.substr(name.length);
                }
        
            }
            alert("not found");
            return null;
        }
    }
    chrome.tabs.query({
        'url': 'https://app.openrole.ai/*'
    }, function(tabs) {
        chrome.scripting.executeScript({
        target: {
            tabId: tabs[0].id,
            allFrames: true
        },
        func: code
        });
    });
}



// function sendJobDetails(URL,NAME,LOGO,DOMAIN,JOBTITLE)
// {
//     fetch("https://app.openrole.ai/api/v1/saved", {
//         "headers": {
//         "accept": "application/json, text/plain, */*",
//         "accept-language": "en-US,en;q=0.9,fil;q=0.8",
//         "content-type": "application/json",
//         "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": "\"Windows\"",
//         "sec-fetch-dest": "empty",
//         "sec-fetch-mode": "cors",
//         "sec-fetch-site": "same-origin",
//         "x-csrftoken": `${getCookie('csrftoken')}`
//         },
//         "referrerPolicy": "same-origin",
//         "body": `{\"stageDate\":\"${new Date().toISOString()}\",\"company\":{\"name\":\"${NAME}\",\"logo\":\"${LOGO}\",\"domain\":\"${DOMAIN}\"},\"title\":\"${JOBTITLE}\",\"stage\":\"Applied\",\"url\":\"${URL}\"}`,
//         "method": "POST",
//         "mode": "cors",
//         "credentials": "include"
//     }).then(resp => resp.json())
//     .then(resp => {
//         console.log(resp)
//     })
// }


// ICON
// fetch("https://autocomplete.clearbit.com/v1/companies/suggest?query=Plexus%20Resource%20Solutions", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\""
//   },
//   "referrerPolicy": "same-origin",
//   "body": null,
//   "method": "GET",
//   "mode": "cors",
//   "credentials": "omit"
// });

//description
// fetch("https://app.openrole.ai/api/v1/saved/811ec58f-28ac-41c2-8d87-0dde23b25c34/", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US,en;q=0.9,fil;q=0.8",
//     "content-type": "application/json",
//     "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "x-csrftoken": "W0Sdi6p3QgpLF57ZLkldydksOEUlAwsQ"
//   },
//   "referrer": "https://app.openrole.ai/saved/811ec58f-28ac-41c2-8d87-0dde23b25c34",
//   "referrerPolicy": "same-origin",
//   "body": "{\"description\":\"<p>testing</p>\"}",
//   "method": "PATCH",
//   "mode": "cors",
//   "credentials": "include"
// });


// This fetch is for Indeed.com (webscrape)
// fetch("https://www.indeed.com/viewjob?jk=b964cd48a3739808&from=hp&tk=1h7diqn1illl7800&viewtype=embedded&advn=5333158426355628&adid=417349407&ad=-6NYlbfkN0AntrpG3BnH061iFC8qMhGbs2MM_drIWvfPZYvb_qS-cy6Rnu1OW6Oy0f9VrWubSGBlaSw1skvaEGn2jX83YGGcCmTYfMhRwr61tfC05ICxC2QXOei0OQy9DCtzSs_iS7oJtJqe9b444vmq2l-ONQUGJEleKzBLzI4H0usAH2Zh7EUUf7E7dSgULP2q45Wv08vt4k036Cy8K1rZu4KKwx0KnMHYjgw_FL5ZTmF5GxwlpqtTUCbsEDB-dgdf0Uc2KN1y_K_3qEsohY5GYp0n5iKVSw1t-4F-qtoMiaqizN7yH_GbeOkuOeQcf8OfVx9x4QiEFNmnk5Cgf-Q3IP4E1pMKk4nKcvfthCy4ha7BWMBL5z5pWG8qCF1mIQwSOilqytqmZhbxhdA6X5Vkk16F_Jy4b7JQu2fVZEI3k4w_lbk8culQ1L5ah49SecsY-oxbLYJhnKVdaw0JwhmQJTcMoXYr1BtiYnQy7fBBtRCbwCqWUFb-ECAmgtQjIWvhX7L6MI9u-AP_R83RHgVq7mmUErZYQ5HNCWstgw263uTYXX6kcDJLbcoPq9ElX0TTImGv9DE%3D&xkcb=SoDA-_M3MttlLa25XJ0KbzkdCdPP&hostrendertype=iframe&hostid=homepage&requestrenderts=1691626121232&isfirstrender=0&topwindowlocation=%2F%3Ffrom%3Dgnav-notifcenter%26vjk%3D01c7525aa681d5a1%26advn%3D2727431576698889", {
//   "headers": {
//     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//     "accept-language": "en-US,en;q=0.9,fil;q=0.8",
//     "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "iframe",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "same-origin",
//     "sec-fetch-user": "?1",
//     "upgrade-insecure-requests": "1"
//   },
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": null,
//   "method": "GET",
//   "mode": "cors",
//   "credentials": "include"
// });