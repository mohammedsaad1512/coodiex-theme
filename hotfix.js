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
// ===== Progress Bar مرتبط بالأوتوبلاي =====
(function(){
  function ensureProgress(root){
    if (root.querySelector('.banner-progress')) return;
    var barWrap = document.createElement('div');
    barWrap.className = 'banner-progress';
    barWrap.innerHTML = '<div class="banner-progress__bar"></div>';
    root.appendChild(barWrap);
  }
  function animateProgress(root, speed){
    var bar = root.querySelector('.banner-progress__bar');
    if (!bar) return;
    bar.style.transition = 'none';
    requestAnimationFrame(function(){
      bar.style.width = '0%';
      bar.style.transition = 'width '+ (speed/1000) +'s linear';
      requestAnimationFrame(function(){ bar.style.width = '100%'; });
    });
  }

  function hookSlick(root){
    var $ = window.jQuery;
    if (!$ || !$(root).on) return;

    ensureProgress(root);

    // التقاط السرعة من slick (autoplaySpeed) أو 4000ms افتراضي
    var speed = ($(root).slick && $(root).slick('getSlick') && $(root).slick('getSlick').options.autoplaySpeed) || 4000;

    $(root).on('init reInit', function(){ animateProgress(root, speed); });
    $(root).on('beforeChange', function(){ animateProgress(root, speed); });

    // لو السلايدر جاهز بالفعل
    try{ animateProgress(root, speed); }catch(e){}
  }

  // انتظر ما يتوسم .bannerizer (من سكريبتك الأساسي)
  function ready(){
    document.querySelectorAll('.bannerizer').forEach(hookSlick);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
// ===== Parallax خفيف بالماوس (IMG أو BG) =====
(function(){
  var maxTilt = 6; // نفس var(--banner-tilt) تقريبًا
  function onMove(e){
    var box = this.getBoundingClientRect();
    var cx = (e.clientX - box.left)/box.width  - .5;
    var cy = (e.clientY - box.top )/box.height - .5;
    var rx =  (cy * maxTilt);
    var ry = -(cx * maxTilt);

    // حرّك الصورة/الخلفية
    var current = this.querySelector('.slick-current') || this;
    var img = current.querySelector('img');
    var bg  = current.querySelector('.slider-item.bg-img') || current;

    if (img){
      img.style.transition = 'transform .08s ease';
      img.style.transform  = 'scale(1.04) translate('+ (cx*10)+'px,'+ (cy*10)+'px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
    }else if (bg){
      bg.style.transition = 'background-position .08s ease';
      var px = 50 + cx*4, py = 50 + cy*4;
      bg.style.backgroundPosition = px+'% '+py+'%';
    }
  }
  function onLeave(){
    var current = this.querySelector('.slick-current') || this;
    var img = current.querySelector('img');
    var bg  = current.querySelector('.slider-item.bg-img') || current;
    if (img){ img.style.transform = 'none'; }
    if (bg ){ bg.style.backgroundPosition = 'center'; }
  }

  function bindOne(root){
    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
  }
  function ready(){
    document.querySelectorAll('.bannerizer').forEach(bindOne);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
// ===== Skeleton Loading: شغّل الشيمر لحد أول صورة تحمل =====
(function(){
  function setLoading(root, on){
    root.classList.toggle('loading', !!on);
  }
  function watchFirstImage(root){
    var img = root.querySelector('img');
    if (!img){ setLoading(root,false); return; }
    if (img.complete){ setLoading(root,false); return; }
    setLoading(root,true);
    img.addEventListener('load', function(){ setLoading(root,false); }, {once:true});
  }
  function ready(){
    document.querySelectorAll('.bannerizer').forEach(watchFirstImage);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
