


document.addEventListener("DOMContentLoaded", function () {
    
    // Get the URL parameter from the query string
    const urlParams = new URLSearchParams(window.location.search);
    const pinterestUrl = urlParams.get('url');

    // Check if the 'url' parameter exists
    if (pinterestUrl) {
        // Get the input field and the download button by their IDs (update IDs accordingly)
        const inputField = document.getElementById("url");  // Update with your input field ID
        const downloadButton = document.getElementById("downloadBtn");  // Update with your button ID

        // Populate the input field with the Pinterest URL
        inputField.value = pinterestUrl;

        // Simulate a click on the download button to process the URL
        downloadButton.click();
    }
    
    var lazyloadImages;

    if ("IntersectionObserver" in window) {
        lazyloadImages = document.querySelectorAll(".lazy");
        var imageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.remove("lazy");
                    imageObserver.unobserve(image);
                }
            });
        });

        lazyloadImages.forEach(function (image) {
            imageObserver.observe(image);
        });
    } else {
        var lazyloadThrottleTimeout;
        lazyloadImages = document.querySelectorAll(".lazy");

        function lazyload() {
            if (lazyloadThrottleTimeout) {
                clearTimeout(lazyloadThrottleTimeout);
            }

            lazyloadThrottleTimeout = setTimeout(function () {
                var scrollTop = window.pageYOffset;
                lazyloadImages.forEach(function (img) {
                    if (img.offsetTop < (window.innerHeight + scrollTop)) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                    }
                });
                if (lazyloadImages.length === 0) {
                    document.removeEventListener("scroll", lazyload);
                    window.removeEventListener("resize", lazyload);
                    window.removeEventListener("orientationChange", lazyload);
                }
            }, 20);
        }

        document.addEventListener("scroll", lazyload);
        window.addEventListener("resize", lazyload);
        window.addEventListener("orientationChange", lazyload);
    }
})

//var siteUrl = WPURLS.siteurl;
//var translations = LANG_STRINGS;
var autoFetch = false;
var executed = false;
let elm;

if (document.getElementById("downloadBtn")) {
    document.getElementById("downloadBtn").addEventListener("click", clickDownload);
}
window.addEventListener("hashchange", function () {
    url();
}, false);
url();

function calculateHash(url, salt) {
    return btoa(url) + (url.length + 1_000) + btoa(salt);
}

function clickDownload(e) {
    //showLoader();
    let url = document.getElementById("url").value.trim();
    //let token = document.getElementById("token").value;
    if (url == "https://www.pinterest.com/")
    {
        showAlert("Geçerli bir pin bağlantısı girin, örn:<br> 1. https://pin.it/1HjA5NBMn <br> 2. https://pinterest.com/pin/46181985 <br> Pin bağlantısını bulmak için <a href='#video-download-process'>buraya tıklayın</a>");
    }
    else if (!isEmpty(url) && isValidURL(url)) {
        executed = true;
        //hideAlert();
        
        document.getElementById("result").style.display = "none";
        
        let headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");
        let urlencoded = new URLSearchParams();
        urlencoded.append("url", url);
        //urlencoded.append("token", token);
        urlencoded.append("hash", calculateHash(url, 'aio-dl'));
        let requestOptions = {
            method: 'POST',
            headers: headers,
            body: urlencoded,
            redirect: 'follow'
        };
        removeHash();
        let statusCode;
        fetch("https://indirpin.com.tr/wp-json/aio-dl/video-data/", requestOptions)
            .then(response => 
            {
                if (response.status === 403) 
                {
                    window.location.reload();
                }
                statusCode = response.status;
                return response.text();
            }).then(result => {
            result = JSON.parse(result)
            if (result.error === undefined) {
                showResult(result)
            } else {
                showAlert(result.error)
            }
        })
            .catch(error => {
                showAlert("Talebiniz İşlenirken Bir Hata Oluştu")
            });
    } else {
        showAlert("Lütfen geçerli bir URL girin");
    }
    e.preventDefault();
}

var input = document.getElementById("url");
if (input) {
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            clickDownload();
            event.preventDefault();
        }
    });

}


function url() {
    if (window.location.href.indexOf("#url=") > -1 && executed === false) {
        let url = window.location.href.match(new RegExp("#url=(.+)", ""))[1];
        let token = document.getElementById("token").value;
        document.getElementById("url").value = url;
        document.getElementById("header").scrollIntoView();
        if (autoFetch && token !== "" && url !== "" && !executed) {
            clickDownload();
            executed = true;
        }
    }
}

function isValidURL(url) {
    if (!elm) {
        elm = document.createElement('input');
        elm.setAttribute('type', 'url');
    }
    elm.value = url;
    return elm.validity.valid;
}

function isEmpty(str) {
    return (!str || str.length === 0);
}

function showLoader() {
    document.getElementById("download-btn-content").style.display = "none";
    document.getElementById("download-btn-content-loader").classList.remove("d-none");
    document.getElementById("downloadBtn").disabled = true;
}

function hideLoader() {
    document.getElementById("download-btn-content").style.display = "";
    document.getElementById("download-btn-content-loader").classList.add("d-none");
    document.getElementById("downloadBtn").disabled = false;
}

function showAlert(message) {
    let alert = document.getElementById("alert");
    alert.innerHTML = message;
    alert.style.textAlign = "left";
    document.getElementById("alert-row").style.display = "";
    //setTimeout(hideAlert, 10000);
    hideLoader();
}

function hideAlert() {
    document.getElementById("alert").innerHTML = "";
    document.getElementById("alert-row").style.display = "none";
}

function removeHash() {
    history.pushState("", document.title, window.location.pathname
        + window.location.search);
}

function showResult(result) 
{
    hideLoader();

    if (typeof result.medias === "undefined") //If there is an error
    {
        if (result.error) {
            //showAlert(result.error);
        } else {
            //showAlert("No media found.");
        }

        return;
    }

    //Templates for single Video/Image
    // let template = '';
    // let videoTemplate = '<div class="container"> <div class="row mb-0"> <div class="col-12 mb-10 mb-lg-0"> <h2 class="mt-8 mb-0 text-center h2"> Videolarınız İndirilmeye Hazır </h2> <div class="row text-center align-items-center justify-content-center my-4"> <div class="col-md-4 col-9 p-0 rounded"> <video class="border border-5" width="100%" controls poster="{{thumbnail}}"> <source src="{{videoLink}}" type="video/mp4"> </video> </div> <div class="col-md-8 col-9 p-0"> <a id="vid-btn-clicked" class="btn col-md-10 col-12 text-white my-1" style="background-color: #E60023;" href="{{downloadLink}}" onclick="downloadButtonClicked(\'vid-btn-clicked\')"> <strong class="h5"> <svg class="me-2 me-md-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg> HD Videoyu İndir </strong> </a> </div> </div> </div> </div> </div>'
    // let imageTemplete = '<div class="container"> <div class="row mb-0"> <div class="col-12 mb-10 mb-lg-0"> <h2 class="mt-8 mb-0 text-center h2"> Fotoğrafınız indirilmeye hazır </h2> <div class="row text-center align-items-center justify-content-center my-4"> <div class="col-md-4 col-9 p-0 rounded"> <img class="position-relative img-fluid w-100 border border-5" style="object-fit: cover; z-index: -1;" src="{{thumbnailLink}}" /> </div> <div class="col-md-8 col-9 p-0"> <a id="img-btn-clicked" class="btn col-md-10 col-12 text-white my-2" style="background-color: #E60023;" href="{{downloadLink}}" onclick="downloadButtonClicked(\'img-btn-clicked\')"> <strong class="h5"> <svg class="me-2 me-md-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg> <span class="d-inline d-md-none">HD Fotoğraf İndir</span><span class="d-none d-md-inline">Orijinal HD Fotoğraf İndir</span> </strong> </a> </div> </div> </div> </div> </div>';
    
    //Templates for single Video/Image
    let pinterestTemplate = '<a data-pin-do="embedPin" data-pin-width="medium" href="https://pinterest.com/pin/{{id}}/"></a>';
    let customVideoTemplate = '<video class="border border-5" width="100%" controls poster="{{thumbnail}}"> <source src="{{videoLink}}" type="video/mp4"> </video>';
    let customImageTemplate = '<img class="position-relative img-fluid w-100 border border-5" style="object-fit: cover; z-index: -1;" src="{{thumbnailLink}}" />';
    let template = '';
    let videoTemplate = '<div class="container"> <div class="row mb-0"> <div class="col-12 mb-10 mb-lg-0"> <h2 class="mt-8 mb-0 text-center h2"> Videolarınız İndirilmeye Hazır </h2> <div class="row text-center align-items-center justify-content-center my-4"> <div class="col-md-4 col-9 p-0 rounded"> {{displayMethod}} </div> <div class="col-md-8 col-9 p-0"> <a id="vid-btn-clicked" class="btn col-md-10 col-12 text-white my-1" style="background-color: #E60023;" href="{{downloadLink}}" onclick="downloadButtonClicked(\'vid-btn-clicked\')"> <strong class="h5"> <svg class="me-2 me-md-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg> HD Videoyu İndir </strong> </a> </div> </div> </div> </div> </div>'
    let imageTemplete = '<div class="container"> <div class="row mb-0"> <div class="col-12 mb-10 mb-lg-0"> <h2 class="mt-8 mb-0 text-center h2"> Fotoğrafınız indirilmeye hazır </h2> <div class="row text-center align-items-center justify-content-center my-4"> <div class="col-md-4 col-9 p-0 rounded"> {{displayMethod}} </div> <div class="col-md-8 col-9 p-0"> <a id="img-btn-clicked" class="btn col-md-10 col-12 text-white my-2" style="background-color: #E60023;" href="{{downloadLink}}" onclick="downloadButtonClicked(\'img-btn-clicked\')"> <strong class="h5"> <svg class="me-2 me-md-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg> <span class="d-inline d-md-none">HD Fotoğraf İndir</span><span class="d-none d-md-inline">Orijinal HD Fotoğraf İndir</span> </strong> </a> </div> </div> </div> </div> </div>';
    
    //Templates for Carousal Videos/Images
    let templates = '';
    let carousalTemplate = '<div class="container"> <div class="row mb-0"> <div class="col-12 mb-10 mb-lg-0"> <h2 class="mt-8 mb-0 text-center h2">Bu URL&#39;de {{count}} Medya Bulundu</h2> <div class="row text-center align-items-center justify-content-evenly my-4"> {{templates}} </div> </div> </div> </div>';
    let carousalVideoTemplate = '<div class="col-md-3 col-9 my-7 mx-1 p-0 rounded"> <video class="border border-2" width="100%" controls poster="{{thumbnail}}"> <source src="{{videoLink}}" type="video/mp4" /> </video> <a id="{{id}}" class="btn col-12 text-white my-2" style="background-color: #e60023;" href="{{downloadLink}}" onclick="downloadButtonClicked(\'{{id}}\')"> <strong class="h6"> <svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5" /> </svg> HD Videoyu İndir </strong> </a> </div>';
    let carousalImageTemplate = '<div class="col-md-3 col-9 my-7 mx-1 p-0 rounded"> <img class="position-relative img-fluid col-12 border border-2" style="object-fit: cover; z-index: -1;" src="{{thumbnailLink}}" /> <a id="{{id}}" class="btn col-12 text-white my-2" style="background-color: #e60023;" href="{{downloadLink}}" onclick="downloadButtonClicked(\'{{id}}\')"> <strong class="h6"> <svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5" /> </svg> HD Fotoğraf İndir </strong> </a> </div>';

    let i = 0;
    let mediasCount = result.medias.length;
    if(mediasCount == 1)
    {
        result.medias.forEach(function (media)
        {
            if(media.extension === 'jpg' || media.extension === 'gif') //It's an image
            {
                template = imageTemplete;
                if(result.displayMethod == 'custom')
                {
                    template = template.replace(new RegExp("{{displayMethod}}", "g"), customImageTemplate);
                    template = template.replace(new RegExp("{{thumbnailLink}}", "g"), media.mediaThumbnail);
                }
                else
                {
                    template = template.replace(new RegExp("{{displayMethod}}", "g"), pinterestTemplate);
                    template = template.replace(new RegExp("{{id}}", "g"), result.pinId);
                }
                if(media.extension === 'gif')
                {
                    template = template.replace(/Fotoğrafınız/g, "Gif'iniz");
                    template = template.replace(/Fotoğraf/g, "GIF");
                }
            }
            else //Its a video
            {
                template = videoTemplate;
                if(result.displayMethod == 'custom')
                {
                    template = template.replace(new RegExp("{{displayMethod}}", "g"), customVideoTemplate);
                    template = template.replace(new RegExp("{{videoLink}}", "g"), media.url);
                    template = template.replace(new RegExp("{{thumbnail}}", "g"), media.mediaThumbnail);
                }
                else
                {
                    template = template.replace(new RegExp("{{displayMethod}}", "g"), pinterestTemplate);
                    template = template.replace(new RegExp("{{id}}", "g"), result.pinId);
                }
            }

            //let downloadLink = siteUrl + "/wp-content/plugins/aio-video-downloader/download.php?source=" + result.source + "&media=" + btoa(0);
            let downloadLink = siteUrl + "/download.php?file_url=" + media.url + "&media=" + btoa(0) + "&size=" + media.size;
            //let downloadLink = "https://phpstack-1361658-5012201.cloudwaysapps.com/download.php?file_url=" + media.url + "&media=" + btoa(0) + "&size=" + media.size;
            if (result.sid) 
            {
                downloadLink += '&sid=' + result.sid;
            }
            template = template.replace(new RegExp("{{downloadLink}}", "g"), downloadLink);
        });
    }
    else
    {
        carousalTemplate = carousalTemplate.replace(new RegExp("{{count}}", "g"), mediasCount);
        result.medias.forEach(function (media)
        {
            if(media.extension === 'jpg') //It's an image
            {
                template = carousalImageTemplate;
                template = template.replace(new RegExp("{{thumbnailLink}}", "g"), media.mediaThumbnail);
            }
            else //Its a video
            {
                template = carousalVideoTemplate;
                template = template.replace(new RegExp("{{videoLink}}", "g"), media.url);
                template = template.replace(new RegExp("{{thumbnail}}", "g"), media.mediaThumbnail);
            }

            //let downloadLink = siteUrl + "/wp-content/plugins/aio-video-downloader/download.php?source=" + result.source + "&media=" + btoa(i);
            let downloadLink = siteUrl + "/download.php?file_url=" + media.url + "&media=" + btoa(i) + "&size=" + media.size;
            //let downloadLink = "https://phpstack-1361658-5012201.cloudwaysapps.com/download.php?file_url=" + media.url + "&media=" + btoa(i) + "&size=" + media.size;
            if (result.sid) 
            {
                downloadLink += '&sid=' + result.sid;
            }
            template = template.replaceAll('{{id}}', `carousel-media-${i}`)
            template = template.replace(new RegExp("{{downloadLink}}", "g"), downloadLink);
            templates = templates.concat(template);
            i++;
        });
        carousalTemplate = carousalTemplate.replace(new RegExp("{{templates}}", "g"), templates);
        template = carousalTemplate; //It's the final template
    }
 
    document.getElementById("result").innerHTML = template;
    
    if (typeof PinUtils !== 'undefined') 
    {
        PinUtils.build();
    } 
    else 
    {
        console.error('Pinterest script not loaded.');
    }
    
    let resultDiv = document.getElementById("result");
    resultDiv.style.display = "";
    document.getElementById("ad-area-2").scrollIntoView();
}

function handleInput(value) 
{
    let pasteBtn = document.getElementById("pasteBtn");
    if(value != '')
    {
        pasteBtn.innerHTML = '<svg width="25px" height="28px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#6e0012"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.048"></g><g id="SVGRepo_iconCarrier"> <g id="Edit / Close_Circle"> <path id="Vector" d="M9 9L11.9999 11.9999M11.9999 11.9999L14.9999 14.9999M11.9999 11.9999L9 14.9999M11.9999 11.9999L14.9999 9M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke="#6e0012" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>';
    }
    else
    {
        pasteBtn.innerHTML = '<svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#6e0012" stroke="#6e0012" stroke-width="0.5"> <g id="SVGRepo_iconCarrier"> <path d="M3 21h5v-1H4V4h2v2h10V4h2v3h.4a.989.989 0 0 1 .6.221V3h-3V2h-3a2 2 0 0 0-4 0H6v1H3zM7 3h3V1.615A.615.615 0 0 1 10.614 1h.771a.615.615 0 0 1 .615.615V3h3v2H7zm4 14h9v1h-9zM9 8v16h13V11.6L18.4 8zm12 15H10V9h7v4h4zm0-11h-3V9h.31L21 11.69zm-10 2h9v1h-9zm0 6h7v1h-7z"> </path> <path fill="none" d="M0 0h24v24H0z"></path> </g> </svg> <span class="d-none d-sm-inline">Yapıştır</span>';
    }
}

if (document.getElementById("pasteBtn")) {
    document.getElementById("pasteBtn").addEventListener("click", (e) => {
        let pasteBtn = document.getElementById("pasteBtn");
        let input = document.getElementById("url");
        let closeBtnHtml = '<svg width="25px" height="28px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#6e0012"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.048"></g><g id="SVGRepo_iconCarrier"> <g id="Edit / Close_Circle"> <path id="Vector" d="M9 9L11.9999 11.9999M11.9999 11.9999L14.9999 14.9999M11.9999 11.9999L9 14.9999M11.9999 11.9999L14.9999 9M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke="#6e0012" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>';
        
        if (pasteBtn.innerHTML === closeBtnHtml) {
            input.value = "";
            pasteBtn.innerHTML = '<svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#6e0012" stroke="#6e0012" stroke-width="0.5"> <g id="SVGRepo_iconCarrier"> <path d="M3 21h5v-1H4V4h2v2h10V4h2v3h.4a.989.989 0 0 1 .6.221V3h-3V2h-3a2 2 0 0 0-4 0H6v1H3zM7 3h3V1.615A.615.615 0 0 1 10.614 1h.771a.615.615 0 0 1 .615.615V3h3v2H7zm4 14h9v1h-9zM9 8v16h13V11.6L18.4 8zm12 15H10V9h7v4h4zm0-11h-3V9h.31L21 11.69zm-10 2h9v1h-9zm0 6h7v1h-7z"> </path> <path fill="none" d="M0 0h24v24H0z"></path> </g> </svg> <span class="d-none d-sm-inline">Yapıştır</span>';
        } 
        else {
            navigator.clipboard.readText().then(clipText =>
                    input.value = clipText,
                pasteBtn.innerHTML = closeBtnHtml);
        }
    });
}

function downloadButtonClicked(id){
    let btn = document.getElementById(id);
    btn.style.pointerEvents="none";
    btn.style.cursor = "not-allowed";
    btn.style.opacity = "0.5";
    setTimeout(() => {
        btn.style.cursor = "";
        btn.style.opacity = "";
        btn.style.pointerEvents = "";
    }, 3000);
}

// Burger menus
document.addEventListener('DOMContentLoaded', function () {
    let i;
// open
    const burger = document.querySelectorAll('.navbar-burger');
    const menu = document.querySelectorAll('.navbar-menu');

    if (burger.length && menu.length) {
        for (i = 0; i < burger.length; i++) {
            burger[i].addEventListener('click', function () {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('d-none');
                }
            });
        }
    }

    // close
    const close = document.querySelectorAll('.navbar-close');
    const backdrop = document.querySelectorAll('.navbar-backdrop');

    if (close.length) {
        for (i = 0; i < close.length; i++) {
            close[i].addEventListener('click', function () {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('d-none');
                }
            });
        }
    }

    if (backdrop.length) {
        for (i = 0; i < backdrop.length; i++) {
            backdrop[i].addEventListener('click', function () {
                for (let j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('d-none');
                }
            });
        }
    }
});
