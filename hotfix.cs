/* ===== إزالة أي خلفيات/جوتّات حوالين سكشن البنر (Fallback عام) ===== */
.banner-wrap,
.banner-wrap *{
  background-color: transparent !important;
}
.banner-wrap{
  padding:0 !important; margin:0 !important; box-shadow:none !important;
}
.banner-wrap .container, .banner-wrap .container-fluid{
  padding-left:0 !important; padding-right:0 !important;
}
.banner-wrap .row{
  --bs-gutter-x:0 !important; margin-left:0 !important; margin-right:0 !important;
}

/* ===== “الدلع” + شكل البانر ===== */
:root{
  --banner-max: 1120px;
  --banner-radius: 22px;
  --banner-shadow: 0 20px 50px rgba(0,0,0,.22);
  --glow-a: rgba(168,85,247,.40);
  --glow-b: rgba(34,211,238,.40);
  --dots-offset: 10px;
}

.bannerizer{
  position:relative;
  width:min(100% - 24px, var(--banner-max)) !important;
  margin:12px auto 22px !important;
  border-radius:var(--banner-radius) !important;
  overflow:hidden !important;
  line-height:0;
  box-shadow:var(--banner-shadow);
  border:1px solid transparent;
  background:
    linear-gradient(#0000,#0000) padding-box,
    linear-gradient(90deg, var(--glow-a), var(--glow-b)) border-box;
  z-index:1;
}

/* توهّج خلفي (خلف الصورة مباشرة) */
.bannerizer::before{
  content:"";
  position:absolute; inset:-28% -18% -36% -18%;
  background:
    radial-gradient(60% 40% at 20% 0%, var(--glow-a), transparent 60%),
    radial-gradient(60% 40% at 80% 100%, var(--glow-b), transparent 60%);
  filter:blur(22px); opacity:.32; pointer-events:none; z-index:0;
}

/* الحاوية الداخلية التي نثبّت عليها الـratio (القيم يضبطها JS) */
.bannerizer .slick-list{
  --arW:128; --arH:45; /* افتراضي لحد ما الـJS يقيس */
  aspect-ratio: var(--arW) / var(--arH);
  height:auto !important; min-height:0 !important;
  border-radius:inherit !important; overflow:hidden !important;
  padding:0 !important; margin:0 !important;
  background:transparent !important; position:relative; z-index:1;
}

/* املأ الارتفاع في كل طبقات السلايد */
.bannerizer .slick-track,
.bannerizer .slick-slide,
.bannerizer .slick-slide > div,
.bannerizer .slider-item,
.bannerizer .slider-item.bg-img{
  height:100% !important;
  border-radius:inherit !important;
  overflow:hidden !important;
  /* ⚠️ متعملش background: transparent هنا عشان ما تمسحش الـBG للصورة */
}

/* IMG */
.bannerizer .slick-slide img{
  width:100% !important; height:100% !important;
  object-fit:cover !important; object-position:center !important;
  display:block !important; border-radius:inherit !important;
}

/* background-image */
.bannerizer .slider-item.bg-img{
  background-size:cover !important; background-position:center !important; background-repeat:no-repeat !important;
}

/* Ken Burns ناعم */
@keyframes kb { from{ transform:scale(1); } to{ transform:scale(1.035); } }
.bannerizer .slick-current img,
.bannerizer .slick-current .slider-item.bg-img{
  animation: kb 12s ease-in-out both;
}

/* الدوتس */
.bannerizer .slick-dots{
  position:absolute !important; left:50%; transform:translateX(-50%);
  bottom:var(--dots-offset) !important; margin:0 !important; padding:0 !important;
  background:transparent !important; z-index:2;
}
.bannerizer .slick-dots li, .bannerizer .slick-dots li button{
  background:transparent !important; border:0 !important;
}

/* اختياري: فل-بليد (يملى الشاشة عرضيًا) — فعّله بإضافة كلاس full-bleed */
.bannerizer.full-bleed{
  width:100vw !important; max-width:100vw !important;
  margin-left:calc(50% - 50vw) !important; margin-right:calc(50% - 50vw) !important;
  border-radius:16px !important;
}
