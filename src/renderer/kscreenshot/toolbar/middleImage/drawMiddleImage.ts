/**
 * 画选中的图片
 */
export default function drawMiddleImage(me) {
  me.scale = 1;
  me.rectangleCanvas.width = me.width * me.scale;
  me.rectangleCanvas.height = me.height * me.scale;
  const ctx = me.rectangleCanvas.getContext("2d");
  ctx.drawImage(
    me.kss,
    me.startX * me.scale,
    (me.startY + me.scrollTop) * me.scale,
    me.width * me.scale,
    me.height * me.scale,
    0,
    0,
    me.width * me.scale,
    me.height * me.scale
  );

  const dataURL = me.rectangleCanvas.toDataURL("image/png");

  me.imgBase64 = dataURL;
  me.snapshootList[0] = dataURL;
  me.currentImgDom.src = me.imgBase64;
}
