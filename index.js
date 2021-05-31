function over(obj) {
    obj.src = "https://user-images.githubusercontent.com/26570275/120158645-50d01e00-c22f-11eb-96f2-27394639f434.png";
}
function out(obj) {

    obj.src = "https://user-images.githubusercontent.com/26570275/115101736-a43d2400-9f81-11eb-8aaa-f05027bfba66.jpeg";
}

function change() {
    var hArray = document.getElementsByTagName("h1");
    for (var i = 0; i < hArray.length; i++) {
        var h1 = hArray[i];
        h1.style.color = "orchid";
            }
}