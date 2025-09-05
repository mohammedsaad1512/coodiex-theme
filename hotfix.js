// Bannerizer — اجبر البانر ياخد نسبة أبعاد صورة كل سلايد (IMG أو BG) + تنظيف اللفّاف
var TRY_SELECTORS = [
  '.main-slider-dots-style.theme1.slick-slider',
  'section.main-slider .slick-slider',
  '.home-slider .slick-slider',
  '.slider-section .slick-slider',
  '.slick-slider'
];

function findSliders(){
  // رجّع أول مجموعة موجودة
  for (var i=0;i<TRY_SELECTORS.length;i++){
    var nodes = document.querySelectorAll(TRY_SELECTORS[i]);
    if (nodes && nodes.length) return nodes;
  }
  // فallback: أول slick-slider في الصفحة
  var any = document.querySelectorAll('.slick-slider');
  return any || [];
}

function curSlide(root){
  return root.querySelector('.slick-current') ||
         root.querySelector('.slick-active')  ||
         root.querySelector('.slick-slide');
}

function readSize(slide, cb){
  if (!slide) return;
  // IMG
  var img = slide.querySelector('img');
  if (img){
    if (img.complete && img.naturalWidth){ cb({w:img.naturalWidth, h:img.naturalHeight}); return; }
    img.addEventListener('load', function(){ cb({w:img.naturalWidth, h:img.naturalHeight}); }, {once:true});
    return;
  }
  // BG
  var el = slide.matches('.slider-item, .slider-item.bg-img') ? slide :
           slide.querySelector('.slider-item, .slider-item.bg-img');
  if (el){
    var bg = getComputedStyle(el).backgroundImage;
    var m = bg && bg.match(/url\(["']?(.+?)["']?\)/);
    if (m && m[1]){
      var im = new Image();
      im.onload = function(){ cb({w:im.naturalWidth, h:im.naturalHeight}); };
      im.src = m[1];
      if (im.complete && im.naturalWidth){ cb({w:im.naturalWidth, h:im.naturalHeight}); }
    }
  }
}

function setAspect(list, w, h){
  if (!list || !w || !h) return;
  list.style.setProperty('--arW', w);
  list.style.setProperty('--arH', h);
  // fallback للمتصفحات القديمة: حساب ارتفاع يدوي
  if (!('aspectRatio' in document.documentElement.style)){
    var ww = list.clientWidth || list.getBoundingClientRect().width;
    if (ww) list.style.height = (ww * h / w) + 'px';
  }
}

function applyRatio(root){
  var list  = root.querySelector('.slick-list');
  var slide = curSlide(root);
  if (!list || !slide) return;
  readSize(slide, function(sz){ if (sz && sz.w && sz.h) setAspect(list, sz.w, sz.h); });
}

function cleanWrapper(root){
  var wrap = root.closest('section') || root.parentElement;
  if (!wrap) return;
  wrap.classList.add('banner-wrap');
  // inline لضمان الأولوية
  wrap.style.background = 'transparent';
  wrap.style.boxShadow  = 'none';
  wrap.style.padding    = '0';
  wrap.style.margin     = '0';
  var cons = wrap.querySelectorAll('.container, .container-fluid');
  cons.forEach(function(c){ c.style.paddingLeft='0'; c.style.paddingRight='0'; });
  var rows = wrap.querySelectorAll('.row');
  rows.forEach(function(r){
    r.style.marginLeft='0'; r.style.marginRight='0';
    r.style.setProperty('--bs-gutter-x','0');
  });
}

function initOne(root){
  if (root.dataset.bannerized) return;
  root.dataset.bannerized = '1';
  root.classList.add('bannerizer');

  cleanWrapper(root);     // اشطب الخلفيات/الجوتّات حوالين السلايدر

  // محاولات أوليّة لحد ما الصور/السلايدر يجهزوا
  var tries = 36, iv = setInterval(function(){
    applyRatio(root);
    if (--tries <= 0) clearInterval(iv);
  }, 250);

  // تحديثات طبيعية
  window.addEventListener('resize', function(){ applyRatio(root); }, {passive:true});
  window.addEventListener('load',   function(){ applyRatio(root); });

  // لو Slick/jQuery موجودين: امسك أحداثه
  var $ = window.jQuery;
  if ($ && $(root).on){
    $(root).on('init reInit setPosition afterChange', function(){ applyRatio(root); });
  }

  // مراقبة تغيّر الكلاسات/الستايل لو حصل سويتش داخلي
  try{
    new MutationObserver(function(){ applyRatio(root); })
      .observe(root, {subtree:true, attributes:true, attributeFilter:['class','style']});
  }catch(e){}
}

function initAll(){
  var sliders = findSliders();
  for (var i=0;i<sliders.length;i++) initOne(sliders[i]);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
else initAll();

// (اختياري) فعّل الـfull-bleed بإضافة الكلاس من هنا
// setTimeout(function(){
//   var first = document.querySelector('.bannerizer');
//   if (first) first.classList.add('full-bleed');
// }, 800);
