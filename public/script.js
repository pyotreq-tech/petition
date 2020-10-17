const canvasJQ = $("canvas");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const signature = $('input[name="signature"]');

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
