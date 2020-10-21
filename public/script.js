const canvasJQ = $("canvas");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const signature = $('input[name="signature"]');
const color = $(".color");
const brush = $(".brush");
const clean = $("#clean");

ctx.strokeStyle = "black";
ctx.lineWidth = 1;

// Canvas painting
canvasJQ.on("mousedown", (e) => {
    let x = e.clientX - canvasJQ.eq(0).offset().left;
    let y = e.clientY - canvasJQ.eq(0).offset().top;
    ctx.moveTo(x, y);
    ctx.beginPath();
    canvasJQ.on("mousemove", (e) => {
        let x = e.clientX - canvasJQ.eq(0).offset().left;
        let y = e.clientY - canvasJQ.eq(0).offset().top;
        ctx.lineTo(x, y);
        ctx.stroke();
    });
    canvasJQ.on("mouseup", () => {
        canvasJQ.unbind("mousemove");
        // Obtaining image url
        signature.val(canvas.toDataURL());
    });
});

// Color adjustments
color.on("mouseup", (e) => {
    ctx.strokeStyle = $(e.target).attr("id");
    if (color.hasClass("border")) {
        $(color).removeClass("border");
    }
    $(e.target).addClass("border");
});

// Brush adjustments
brush.on("mouseup", (e) => {
    if (brush.hasClass("border")) {
        $(brush).removeClass("border");
    }
    $(e.target).addClass("border");

    if ($(e.target).attr("id") === "small") {
        ctx.lineWidth = 1;
    } else if ($(e.target).attr("id") === "medium") {
        ctx.lineWidth = 3;
    } else if ($(e.target).attr("id") === "large") {
        ctx.lineWidth = 5;
    }
});

// Clean button setup
clean.on("click", () => {
    console.log("click");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
