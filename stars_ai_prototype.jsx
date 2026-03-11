import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { id: "pain", question: "你好呀～我是星辰，很高兴认识你 ✨\n\n想先聊聊：平时工作上，你最头疼的是哪一块？可以多说说，我会认真看。", tag: "经营难点", options: ["库存管理混乱", "成本算不清楚", "财务数据滞后", "其他问题"], preferInput: true, inputPlaceholder: "例如：库存经常对不上、成本算不清、对不上账… 随便说说～",
    followUps: ["能具体说说吗？比如是供应商不稳定、价格波动大、对账困难，还是别的？说细一点我更好帮你对症下药～"] },
  { id: "industry", question: "嗯嗯，很多老板都有同感～\n\n那你们公司主要是做什么业务的呀？", tag: "行业", options: ["五金加工制造", "电商零售", "批发贸易", "餐饮服务"], preferInput: false, inputPlaceholder: "选一个或简单写几句行业情况～" },
  { id: "detail", question: "了解～再问具体一点：你觉得最影响利润的环节是？说得越具体，我越能帮你对症下药。", tag: "商品", options: ["原材料成本波动", "人工成本控制", "库存积压", "应收账款"], preferInput: true, inputPlaceholder: "例如：采购价不稳、损耗大、账期长…",
    followUps: ["明白了，还有别的环节也在拉低利润吗？或者这一点里最让你头疼的具体是啥？"] },
  { id: "scale", question: "对你已经有点数啦～方便再说下，公司大概多少人？", tag: "规模", options: ["5人以下小团队", "5-20人", "20-50人", "50-100人"], preferInput: false, inputPlaceholder: "选一个或简单描述团队规模～" },
  { id: "goal", question: "最后一个小问题～如果 3 个月后回头看，你最希望我帮你做到哪件事？可以写一段，我会记下来。", tag: "目标", options: ["看清真实成本", "库存零差错", "现金流可预测", "全面数字化"], preferInput: true, inputPlaceholder: "例如：希望库存再也不会盘亏、能随时看到每个单的利润…" },
];

// 了解星辰AI 分支：对话中穿插视频、图片等
const DISCOVER_STEPS = [
  {
    id: "intro",
    question: "你好呀～很高兴你想先了解星辰 AI ✨\n\n下面用一分钟小视频，带你看看星辰是怎么帮企业管好库存、算清成本的。",
    media: { type: "video", url: "https://assets.mixkit.co/videos/12266/12266-720.mp4", caption: "星辰 AI 一分钟介绍" },
    options: ["看完了，继续", "我想直接免费试用"],
  },
  {
    id: "agents",
    question: "星辰里有六大智能 Agent，每个都像一位不知疲倦的业务专家。\n\n这张图是它们在经营链路里各自负责的环节～",
    media: { type: "image", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop", caption: "AI Agent 矩阵示意" },
    options: ["想了解某个 Agent", "继续看产品", "去免费试用"],
  },
  {
    id: "product",
    question: "星辰是面向小微企业的 AI 一体化 ERP，从进销存到成本、财务都能管。\n\n很多客户用 3 个月就能把库存准确率从 70% 提到 95% 以上～",
    media: { type: "image", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop", caption: "星辰产品能力一览" },
    options: ["看客户案例", "免费试用", "联系售前"],
  },
  {
    id: "cta",
    question: "大致就是这样～如果你想马上体验，可以点「免费试用」我会帮你快速配置；或者先回首页慢慢看。",
    options: ["免费试用", "返回首页"],
  },
];

const AGENTS = [
  { icon: "📈", name: "销售 Agent", desc: "智能商机管理、客户跟进提醒、报价单自动生成，提升成交转化率", color: "#63b6ff" },
  { icon: "🧾", name: "报税 Agent", desc: "自动归类进销项发票、增值税申报预填、税务风险实时预警", color: "#00e4a0" },
  { icon: "📦", name: "采购 Agent", desc: "智能补货建议、供应商比价分析、采购订单自动生成与跟踪", color: "#ffb347" },
  { icon: "💰", name: "财务 Agent", desc: "自动记账对账、现金流预测、应收应付智能催办与分析", color: "#c084fc" },
  { icon: "🏭", name: "生产 Agent", desc: "BOM 智能拆解、排产建议、生产成本实时归集与异常预警", color: "#f472b6" },
  { icon: "📊", name: "经营分析 Agent", desc: "多维利润分析、经营日报自动生成、关键指标异动即时通知", color: "#38bdf8" },
];

const INDUSTRIES = [
  { icon: "🍜", name: "食品饮料", desc: "保质期管理 · 批次追溯 · 渠道分销", bg: "linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)" },
  { icon: "📱", name: "家电数码", desc: "串号管理 · 售后追踪 · 渠道库存", bg: "linear-gradient(135deg, #63b6ff 0%, #5b7fff 100%)" },
  { icon: "🔌", name: "电子元器件", desc: "料号管理 · 替代料匹配 · MOQ优化", bg: "linear-gradient(135deg, #00e4a0 0%, #00b4d8 100%)" },
  { icon: "🔩", name: "五金配件", desc: "多规格SKU · 称重计价 · 来料加工", bg: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" },
  { icon: "🏠", name: "家装建材", desc: "项目制管理 · 工程报价 · 安装派单", bg: "linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)" },
  { icon: "⚙️", name: "机械设备", desc: "BOM深度管理 · 工序成本 · 售后合同", bg: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)" },
  { icon: "💼", name: "商业服务", desc: "项目工时 · 服务合同 · 收款进度", bg: "linear-gradient(135deg, #f0abfc 0%, #c084fc 100%)" },
  { icon: "🛒", name: "电子商务", desc: "多平台订单 · 仓储物流 · 退换货", bg: "linear-gradient(135deg, #fb923c 0%, #f43f5e 100%)" },
];

const PRODUCTS = [
  {
    name: "账无忧", target: "面向代账公司",
    desc: "批量管理多家企业账套，自动化记账报税，客户协作门户，效率提升300%",
    price: "¥199/月起", color: "#00e4a0",
    features: ["多账套批量处理", "自动凭证生成", "客户自助查账", "一键批量报税"],
    badge: "代账首选",
  },
  {
    name: "精斗云", target: "面向微型企业",
    desc: "开箱即用的进销存与记账工具，手机就能管生意，1人也能用得转",
    price: "¥0 — 免费起步", color: "#63b6ff",
    features: ["极简进销存", "手机开单收款", "利润自动核算", "微信小程序"],
    badge: "轻量之选",
  },
  {
    name: "星辰", target: "面向小型企业",
    desc: "AI 驱动的一体化 ERP，覆盖库存、成本、财务全链路，越用越智能",
    price: "¥299/月起", color: "#c084fc",
    features: ["AI 智能 Agent", "全链路 ERP", "行业深度方案", "数据智能分析"],
    badge: "旗舰产品", highlighted: true,
  },
];

const CASES = [
  { company: "深圳华强电子", industry: "电子元器件", avatar: "华", quote: "上线星辰3个月，库存准确率从72%提升到98%，每月少亏十几万。", metric: "库存准确率 +26%", color: "#63b6ff" },
  { company: "杭州味享食品", industry: "食品饮料", avatar: "味", quote: "以前月底算成本要3天，现在星辰实时就能看到每个SKU的毛利。", metric: "成本核算 3天→实时", color: "#00e4a0" },
  { company: "东莞精工五金", industry: "五金配件", avatar: "精", quote: "采购Agent自动比价帮我们年省采购成本8%，老板直接给团队发了奖金。", metric: "采购成本 -8%", color: "#ffb347" },
  { company: "成都宏远机械", industry: "机械设备", avatar: "宏", quote: "BOM管理终于理清了，现在报价又快又准，客户都说我们专业了很多。", metric: "报价效率 +200%", color: "#c084fc" },
];

const EVENTS = [
  { date: "2026.03.15", tag: "线上直播", title: "星辰 AI 新品发布会", desc: "发布全新 Agent 市场与行业解决方案 2.0，在线体验全流程 Demo", hot: true },
  { date: "2026.03.22", tag: "行业沙龙", title: "制造业数字化转型实战分享", desc: "邀请3家标杆客户现场分享 ERP 落地经验，限额50人" },
  { date: "2026.04.01", tag: "限时活动", title: "春季特惠 — 专业版年付85折", desc: "3月25日-4月10日期间，年付专业版享受85折优惠，新老用户均可参与" },
  { date: "2026.04.12", tag: "线下展会", title: "深圳中小企业数字化博览会", desc: "星辰 AI 亮相E3展馆，现场免费诊断企业管理痛点，扫码领取30天Pro体验" },
];

const AGENT_TAGS = ["行业", "商品", "经营难点", "规模", "目标"];

const DASHBOARD_QUICK_ACTIONS = [
  { icon: "📊", label: "生成经营分析报告" },
  { icon: "❓", label: "咨询业务问题" },
  { icon: "💡", label: "提出创新建议" },
  { icon: "📁", label: "创建知识库" },
];

const DASHBOARD_CARDS = [
  { icon: "🤝", title: "使用样本公司", desc: "专业企业经营分析报告，可帮助您快速上手体验", btn: "使用" },
  { icon: "📥", title: "导入你的数据", desc: "从账套系统、凭证、明细账、协同平台导入数据，生成实时看板，让你轻松管理", btn: "导入" },
  { icon: "📄", title: "手动新增第一张单据", desc: "可帮助星辰记录凭证、单据，分步了解你的业务流程", btn: "新增" },
];

const SAMPLE_COMPANY_NAME = "HLBZ 餐饮用品公司";

const DASH_DATA = {
  revenue: "¥1,284,500", revenueDelta: "+8.3%", cost: "¥876,200", costDelta: "-2.1%",
  inventory: "3,842", inventoryAlert: "12 项低库存", receivable: "¥423,800", receivableDelta: "账期 +3天",
  alerts: [
    { type: "warn", text: "充电宝外壳库存预计12天内耗尽，建议尽快补货" },
    { type: "info", text: "本月毛利率较上月提升1.2%，主要来自原材料成本下降" },
    { type: "err", text: "客户「深圳华强电子」应收款已逾期15天，建议跟进" },
  ],
  inventory_items: [
    { name: "充电宝外壳 A3", stock: 120, status: "low", days: 12 },
    { name: "USB-C 连接器", stock: 4500, status: "ok", days: 45 },
    { name: "锂电池 3000mAh", stock: 890, status: "med", days: 22 },
    { name: "PCB 主板 V2", stock: 2100, status: "ok", days: 38 },
    { name: "包装盒（黑色）", stock: 340, status: "low", days: 8 },
    { name: "数据线 1m", stock: 6200, status: "ok", days: 60 },
  ],
  cashflow: [
    { month: "1月", inflow: 980, outflow: 820 }, { month: "2月", inflow: 1120, outflow: 910 },
    { month: "3月", inflow: 1050, outflow: 870 }, { month: "4月", inflow: 1284, outflow: 876 },
    { month: "5月", inflow: 1350, outflow: 920 }, { month: "6月", inflow: 1410, outflow: 950 },
  ],
};

// 升级页：三档版本（参考 Manus 划分）
const UPGRADE_PLANS = [
  {
    id: "basic",
    name: "基础版",
    priceDaily: "¥9",
    priceMonthly: "¥199",
    priceYearly: "¥1,500",
    billingLabel: "基础版",
    description: "基础月使用量",
    badge: null,
    buttonText: "升级",
    highlighted: false,
    features: [
      "300 每日刷新积分",
      "4,000 巨量积分/月",
      "自定义经营分析",
      "多维度报表与看板",
      "自动生成经营日报",
      "6 大 Agent 基础能力",
      "抢先体验 Beta 功能",
      "5 个并发任务",
      "10 个定时任务",
    ],
  },
  {
    id: "pro",
    name: "专业版",
    priceMonthly: "¥299",
    priceYearly: "¥2,990",
    billingLabel: "标准版",
    description: "可自定义月度用量",
    badge: "7 天免费",
    buttonText: "当前版本",
    highlighted: true,
    customOption: "8,000 积分/月",
    features: [
      "300 每日刷新积分",
      "8,000 积分/月 可调",
      "自定义研究与报表",
      "多语言与多账套",
      "自动生成幻灯片",
      "广泛研究与对标",
      "抢先体验 Beta 功能",
      "20 个并发任务",
      "20 个定时任务",
    ],
  },
  {
    id: "enterprise",
    name: "企业版",
    priceMonthly: "¥999",
    priceYearly: "¥9,990",
    billingLabel: "团队版",
    description: "可提升团队生产力",
    badge: null,
    buttonText: "升级",
    highlighted: false,
    features: [
      "300 每日刷新积分",
      "40,000 巨量积分/月",
      "大规模研究与 BI",
      "企业级权限与审计",
      "稳定制作与 API",
      "专属客户成功经理",
      "抢先体验 Beta 功能",
      "50 个并发任务",
      "50 个定时任务",
    ],
  },
];

// ─── Shared Components ───────────────────────────────────
function TypeWriter({ text, speed = 30, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    idx.current = 0; setDisplayed("");
    const iv = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) { clearInterval(iv); onDone?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return <span style={{ whiteSpace: "pre-wrap" }}>{displayed}</span>;
}

function PulseRing({ size = 120 }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(99,182,255,0.3)", animation: `pulseRing 2.4s ease-out ${i * 0.8}s infinite` }} />
      ))}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <img
          src="./ai-avatar.png"
          alt="星辰 AI"
          style={{
            width: "78%",
            height: "78%",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(99,182,255,0.7)",
            boxShadow: "0 0 28px rgba(99,182,255,0.6)",
          }}
        />
      </div>
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(99,182,255,0.12)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #63b6ff, #00e4a0)", transition: "width 0.8s cubic-bezier(.4,0,.2,1)", boxShadow: "0 0 12px rgba(0,228,160,0.4)" }} />
    </div>
  );
}

function TagPill({ label, active, light }) {
  if (light) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, background: active ? "rgba(41,113,235,0.12)" : "rgba(17,24,39,0.06)", color: active ? "rgb(41,113,235)" : "rgba(17,24,39,0.55)", border: `1px solid ${active ? "rgba(41,113,235,0.3)" : "rgba(17,24,39,0.1)"}`, transition: "all 0.5s" }}>
        <span style={{ fontSize: 8, opacity: active ? 1 : 0.4 }}>●</span>{label}
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, background: active ? "rgba(0,228,160,0.15)" : "rgba(99,182,255,0.08)", color: active ? "#00e4a0" : "rgba(255,255,255,0.35)", border: `1px solid ${active ? "rgba(0,228,160,0.3)" : "rgba(255,255,255,0.08)"}`, transition: "all 0.5s" }}>
      <span style={{ fontSize: 8, opacity: active ? 1 : 0.3 }}>●</span>{label}
    </span>
  );
}

function StatCard({ label, value, delta, deltaColor, icon }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px", flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><span>{icon}</span> {label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      {delta && <div style={{ fontSize: 12, marginTop: 6, color: deltaColor || "rgba(255,255,255,0.4)" }}>{delta}</div>}
    </div>
  );
}

function MiniChart({ data }) {
  const max = Math.max(...data.map((d) => Math.max(d.inflow, d.outflow)));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 100, width: "100%" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 80, width: "100%" }}>
            <div style={{ flex: 1, height: `${(d.inflow / max) * 100}%`, background: "linear-gradient(180deg, #63b6ff, rgba(99,182,255,0.2))", borderRadius: "4px 4px 0 0", minHeight: 4 }} />
            <div style={{ flex: 1, height: `${(d.outflow / max) * 100}%`, background: "linear-gradient(180deg, #ff6b8a, rgba(255,107,138,0.2))", borderRadius: "4px 4px 0 0", minHeight: 4 }} />
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal(0.12);
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

function SectionTitle({ tag, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      {tag && <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#63b6ff", textTransform: "uppercase", marginBottom: 12 }}>{tag}</div>}
      <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #0f172a 0%, #2563eb 50%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.3 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 16, color: "rgba(15,23,42,0.7)", marginTop: 12, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>{subtitle}</p>}
    </div>
  );
}

function AuthModal({
  visible,
  onClose,
  onStart,
  defaultRegion = "cn",
  onWeChatLogin,
  onGoogleLogin,
  onAppleLogin,
  onMicrosoftLogin,
}) {
  const [region, setRegion] = useState(defaultRegion); // "cn" | "global"

  if (!visible) return null;

  const safeCall = (fn, label) => {
    if (typeof fn === "function") {
      fn();
    } else {
      console.log(`点击了 ${label} 登录（占位）`);
    }
    onStart?.("免费试用");
  };

  const renderChinaRegion = () => (
    <div style={{ marginTop: 8 }}>
      <div style={{ marginBottom: 16, fontSize: 13, color: "#4b5563" }}>使用微信扫码登录，适用于中国大陆地区用户</div>
      <div style={{ marginBottom: 16, padding: 16, borderRadius: 16, border: "1px dashed #e5e7eb", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 160, height: 160, borderRadius: 16, background: "repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 6px, #f9fafb 6px, #f9fafb 12px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12 }}>
          微信二维码占位
        </div>
      </div>
      <button
        onClick={() => safeCall(onWeChatLogin, "微信")}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          background: "#22c55e",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>💚</span>
        微信扫码登录并开始体验
      </button>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>扫码仅用于安全登录，不会泄露你的聊天或业务数据。</div>
    </div>
  );

  const renderGlobalRegion = () => (
    <div style={{ marginTop: 8 }}>
      <div style={{ marginBottom: 16, fontSize: 13, color: "#4b5563" }}>使用常用账号快速登录，适用于非中国大陆地区用户</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
        <button
          onClick={() => safeCall(onGoogleLogin, "Google")}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>🟢</span>
          使用 Google 登录
        </button>
        <button
          onClick={() => safeCall(onAppleLogin, "Apple")}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid #111827",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            background: "#111827",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}></span>
          使用 Apple ID 登录
        </button>
        <button
          onClick={() => safeCall(onMicrosoftLogin, "Microsoft")}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>🪟</span>
          使用 Microsoft 账号登录
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>暂未真正接入第三方登录，本区域为交互占位，后续可接入 OAuth。</div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", cursor: "pointer" }} onClick={onClose} aria-hidden="true" />
      <div style={{ position: "relative", display: "flex", maxWidth: 520, width: "100%", background: "#ffffff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", overflow: "hidden", border: "1px solid #e5e7eb" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 160, flexShrink: 0, background: "linear-gradient(180deg, rgba(41,113,235,0.08), rgba(41,113,235,0.02))", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <img src="assets/ai-avatar.png" alt="" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 24px rgba(41,113,235,0.45)" }} />
        </div>
        <div style={{ flex: 1, padding: "28px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 2 }}>注册 / 登录</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>开始你的 30 天免费试用</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af", padding: 4 }} aria-label="关闭">
              ×
            </button>
          </div>

          <div style={{ marginBottom: 12, fontSize: 12, color: "#6b7280" }}>根据你所在地区选择登录方式：</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setRegion("cn")}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: region === "cn" ? "rgb(41,113,235)" : "#e5e7eb",
                background: region === "cn" ? "rgba(41,113,235,0.08)" : "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: region === "cn" ? "rgb(37,99,235)" : "#4b5563",
                fontFamily: "inherit",
              }}
            >
              中国大陆
            </button>
            <button
              onClick={() => setRegion("global")}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: region === "global" ? "rgb(41,113,235)" : "#e5e7eb",
                background: region === "global" ? "rgba(41,113,235,0.08)" : "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: region === "global" ? "rgb(37,99,235)" : "#4b5563",
                fontFamily: "inherit",
              }}
            >
              其他地区
            </button>
          </div>

          {region === "cn" ? renderChinaRegion() : renderGlobalRegion()}

          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 16, lineHeight: 1.6 }}>
            点击登录即表示你已阅读并同意
            <span style={{ color: "rgb(41,113,235)", cursor: "pointer", marginLeft: 4 }}>《用户协议》</span>
            和
            <span style={{ color: "rgb(41,113,235)", cursor: "pointer", marginLeft: 4 }}>《隐私政策》</span>
            。
          </div>
        </div>
      </div>
    </div>
  );
}

function Nav({ onTrial, onPrice }) {
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: "0 32px", height: 60, display: "flex", alignItems: "center", borderBottom: "1px solid rgba(41,113,235,0.08)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(24px)" }}>
      <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22, filter: "drop-shadow(0 0 6px rgba(41,113,235,0.5))" }}>✦</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5, color: "rgb(41,113,235)" }}>星辰 AI</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 14, color: "rgba(17,24,39,0.65)" }}>
          {["产品", "解决方案", "社区", "应用市场"].map((l) => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
          <span onClick={onPrice} style={{ cursor: "pointer" }}>价格</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "rgba(17,24,39,0.7)", cursor: "pointer" }}>登录</span>
          <span
            onClick={onTrial}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 20px",
              borderRadius: 24,
              background: "linear-gradient(135deg, rgb(41,113,235), #4f8df5)",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            免费试用
          </span>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
export default function StarsAI() {
  const [phase, setPhase] = useState("landing");
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  const [pct, setPct] = useState(0);
  const [showAgent, setShowAgent] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [dashReady, setDashReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [dashboardTab, setDashboardTab] = useState("任务");
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" | "annual"
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // 在 dashboard 内以弹窗形式显示升级
  const [showAuthModal, setShowAuthModal] = useState(false); // 注册/登录弹窗，通过后进入 onboarding
  const [authTab, setAuthTab] = useState("login"); // "login" | "register"
  const [showExpandMenu, setShowExpandMenu] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [hoveredIndustry, setHoveredIndustry] = useState(null);
  const [onboardingInput, setOnboardingInput] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const startOnboarding = useCallback((chipText) => {
    setPhase("onboarding");
    setStep(0);
    setFollowUpIndex(0);
    setMessages([{ role: "user", text: chipText || "免费试用" }]);
    setShowAgent(true);
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => { setTyping(false); setMessages((p) => [...p, { role: "ai", text: ONBOARDING_STEPS[0].question }]); }, 800);
    }, 400);
  }, []);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const doStartOnboarding = useCallback((chipText) => {
    setShowAuthModal(false);
    startOnboarding(chipText);
  }, [startOnboarding]);

  const startDiscover = useCallback(() => {
    setPhase("discover");
    setStep(0);
    setMessages([{ role: "user", text: "了解星辰AI" }]);
    setShowAgent(true);
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((p) => [...p, { role: "ai", text: DISCOVER_STEPS[0].question, media: DISCOVER_STEPS[0].media }]);
      }, 800);
    }, 400);
  }, []);

  const handleDiscoverOption = useCallback((optionText) => {
    if (optionText === "免费试用") {
      setShowAuthModal(true);
      return;
    }
    if (optionText === "返回首页") {
      setPhase("landing");
      setStep(0);
      setMessages([]);
      setTyping(false);
      setShowAgent(false);
      return;
    }
    const next = step + 1;
    setStep(next);
    setMessages((p) => [...p, { role: "user", text: optionText }]);
    if (next < DISCOVER_STEPS.length) {
      const nextStep = DISCOVER_STEPS[next];
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages((p) => [...p, { role: "ai", text: nextStep.question, media: nextStep.media }]);
        }, 600);
      }, 300);
    }
  }, [step]);

  const handleOption = useCallback((optionText) => {
    if (step >= ONBOARDING_STEPS.length) return;
    const cur = ONBOARDING_STEPS[step];
    setMessages((p) => [...p, { role: "user", text: optionText }]);
    setActiveTags((p) => [...p, cur.tag]);
    setPct(Math.min(100, ((step + 1) / ONBOARDING_STEPS.length) * 100));
    const next = step + 1;
    setStep(next);
    setFollowUpIndex(0);
    if (next < ONBOARDING_STEPS.length) {
      setTimeout(() => { setTyping(true); setTimeout(() => { setTyping(false); setMessages((p) => [...p, { role: "ai", text: ONBOARDING_STEPS[next].question }]); }, 1000); }, 500);
    } else {
      setTimeout(() => { setCelebrating(true); setTimeout(() => { setPhase("dashboard"); setTimeout(() => setDashReady(true), 100); }, 2200); }, 600);
    }
  }, [step]);

  const handleSendInput = useCallback(() => {
    const text = onboardingInput.trim();
    if (!text || step >= ONBOARDING_STEPS.length) return;
    const cur = ONBOARDING_STEPS[step];
    setOnboardingInput("");
    setMessages((p) => [...p, { role: "user", text }]);

    const hasFollowUps = cur.followUps && cur.followUps.length > 0;
    const canShowFollowUp = hasFollowUps && followUpIndex < cur.followUps.length;

    if (canShowFollowUp) {
      const nextFollowUp = cur.followUps[followUpIndex];
      setFollowUpIndex((i) => i + 1);
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages((p) => [...p, { role: "ai", text: nextFollowUp }]);
        }, 800);
      }, 400);
      return;
    }

    setActiveTags((p) => [...p, cur.tag]);
    setPct(Math.min(100, ((step + 1) / ONBOARDING_STEPS.length) * 100));
    const next = step + 1;
    setStep(next);
    setFollowUpIndex(0);
    if (next < ONBOARDING_STEPS.length) {
      setTimeout(() => { setTyping(true); setTimeout(() => { setTyping(false); setMessages((p) => [...p, { role: "ai", text: ONBOARDING_STEPS[next].question }]); }, 1000); }, 500);
    } else {
      setTimeout(() => { setCelebrating(true); setTimeout(() => { setPhase("dashboard"); setTimeout(() => setDashReady(true), 100); }, 2200); }, 600);
    }
  }, [step, onboardingInput, followUpIndex]);

  // ═══════════════════════════════════════════════════════
  //  UPGRADE（三档版本：landing 全页深色 / dashboard 弹窗白蓝）
  // ═══════════════════════════════════════════════════════
  if (phase === "upgrade") {
    const goBack = () => setPhase("landing");

    const upgradeContent = (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#fff" }}>升级到 星辰 Pro</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: billingCycle === "monthly" ? "#fff" : "rgba(255,255,255,0.5)" }}>月付</span>
            <button
              onClick={() => setBillingCycle((c) => (c === "monthly" ? "annual" : "monthly"))}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: "none",
                background: billingCycle === "annual" ? "rgb(41,113,235)" : "rgba(255,255,255,0.2)",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div style={{ position: "absolute", top: 2, left: billingCycle === "monthly" ? 2 : 22, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </button>
            <span style={{ fontSize: 14, color: billingCycle === "annual" ? "#fff" : "rgba(255,255,255,0.5)" }}>年付 - 节省 17%</span>
          </div>
          <button onClick={goBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", padding: 4 }} aria-label="关闭">×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
          {UPGRADE_PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: "#374151",
                borderRadius: 16,
                padding: "28px 24px",
                border: plan.highlighted ? "2px solid rgb(41,113,235)" : "1px solid rgba(255,255,255,0.08)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {plan.badge && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, background: "rgb(41,113,235)", color: "#fff" }}>{plan.badge}</div>
              )}
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{plan.billingLabel}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                {billingCycle === "annual" ? `${plan.priceYearly} / 年` : plan.priceDaily ? `${plan.priceDaily} / 日` : `${plan.priceMonthly} / 月`}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>{plan.description}</div>
              {plan.customOption && (
                <div style={{ marginBottom: 20, padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {plan.customOption}
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>▾</span>
                </div>
              )}
              <button
                onClick={() => plan.highlighted && plan.buttonText.includes("试用") ? openAuthModal() : goBack()}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: plan.highlighted ? "rgb(41,113,235)" : "#111827",
                  color: "#fff",
                  marginBottom: 24,
                }}
              >
                {plan.buttonText}
              </button>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 12 }}>
                    <span style={{ color: "rgb(74,222,128)", fontSize: 16 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>星辰 团队企业计划</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>面向中小型团队及行业标准认证。</div>
            </div>
            <span style={{ fontSize: 14, color: "rgb(41,113,235)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>了解更多 <span>→</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>安全与合规</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>您的数据安全受保护。了解更多。</div>
            </div>
            <span style={{ fontSize: 14, color: "rgb(41,113,235)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>了解更多 <span>→</span></span>
          </div>
        </div>
      </>
    );

    return (
      <>
        <div style={{ minHeight: "100vh", background: "#1f2937", color: "#f9fafb", fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif" }}>
          <style>{globalCSS}</style>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px" }}>
            {upgradeContent}
          </div>
        </div>
        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onStart={doStartOnboarding}
        />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  LANDING — Waterfall
  // ═══════════════════════════════════════════════════════
  if (phase === "landing") {
    return (
      <>
        <div style={{ background: "#ffffff", color: "#111827", fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif", minHeight: "100vh" }}>
          <style>{globalCSS}</style>
          <Nav onTrial={() => openAuthModal()} onPrice={() => setPhase("upgrade")} />

        {/* ───── S1: Hero + AI Chat ───── */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", paddingTop: 60 }}>
          <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "140%", height: "80%", background: "radial-gradient(ellipse, rgba(99,182,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,228,160,0.04), transparent 70%)", pointerEvents: "none" }} />

          <Reveal>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
              <div style={{ animation: "floatY 4s ease-in-out infinite" }}><PulseRing size={130} /></div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              style={{
                fontSize: 52,
                fontWeight: 800,
                textAlign: "center",
                letterSpacing: -1.5,
                lineHeight: 1.2,
                background: "linear-gradient(135deg, rgb(41,113,235), #4f8df5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: "0 0 16px",
              }}
            >
              你好，欢迎你
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: 18, color: "rgba(17,24,39,0.6)", textAlign: "center", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>
              回答 5 个问题，2 分钟获得你的 AI 商业管理伙伴
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div
              onClick={() => openAuthModal()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: 540,
                maxWidth: "90vw",
                background: "#f3f6ff",
                border: "1px solid rgba(41,113,235,0.16)",
                borderRadius: 28,
                padding: "16px 22px",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              <span style={{ color: "rgba(17,24,39,0.45)" }}>想要管好库存？告诉星辰你的需求…</span>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgb(41,113,235), #4f8df5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                ↑
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
              {["了解星辰AI", "选择适合我的产品", "免费试用", "联系售前", "更多"].map((c) => (
                <span
                  key={c}
                  onClick={() => (c === "了解星辰AI" ? startDiscover() : c === "免费试用" ? openAuthModal() : openAuthModal(c))}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 24,
                    fontSize: 13,
                    background: "rgba(41,113,235,0.06)",
                    border: "1px solid rgba(41,113,235,0.16)",
                    color: "rgba(17,24,39,0.7)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
          <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", animation: "floatY 2s ease-in-out infinite" }}>
            <div style={{ width: 24, height: 40, borderRadius: 12, border: "2px solid rgba(41,113,235,0.3)", display: "flex", justifyContent: "center", paddingTop: 8 }}>
              <div style={{ width: 3, height: 8, borderRadius: 2, background: "rgba(41,113,235,0.7)", animation: "scrollDot 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        </section>

        {/* ───── S2: AI Agent 能力 ───── */}
        <section style={{ padding: "100px 20px", maxWidth: 1200, margin: "0 auto" }}>
          <Reveal><SectionTitle tag="AI Agent 矩阵" title="六大智能 Agent，覆盖经营全链路" subtitle="每个 Agent 都是一位不知疲倦的业务专家，7×24 小时为你工作" /></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {AGENTS.map((a, i) => (
              <Reveal key={a.name} delay={i * 0.08}>
                <div onMouseEnter={() => setHoveredAgent(i)} onMouseLeave={() => setHoveredAgent(null)} style={{ position: "relative", background: hoveredAgent === i ? "#eef2ff" : "#f9fafb", border: `1px solid ${hoveredAgent === i ? a.color + "40" : "#e5e7eb"}`, borderRadius: 20, padding: "32px 28px", cursor: "pointer", transition: "all 0.35s", transform: hoveredAgent === i ? "translateY(-4px)" : "none", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${a.color}10, transparent 70%)`, transition: "opacity 0.4s", opacity: hoveredAgent === i ? 1 : 0 }} />
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{a.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{a.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(15,23,42,0.7)", lineHeight: 1.7 }}>{a.desc}</div>
                  <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: a.color, opacity: hoveredAgent === i ? 1 : 0, transition: "opacity 0.3s" }}>了解详情 <span style={{ fontSize: 16 }}>→</span></div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───── S3: 行业解决方案 ───── */}
        <section style={{ padding: "100px 20px", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, rgba(99,182,255,0.02) 30%, rgba(99,182,255,0.02) 70%, transparent)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
            <Reveal><SectionTitle tag="行业解决方案" title="深耕 8 大行业，开箱即用" subtitle="每个行业方案预置专属业务模板、字段与工作流，无需从零配置" /></Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {INDUSTRIES.map((ind, i) => (
                <Reveal key={ind.name} delay={i * 0.06}>
                  <div onMouseEnter={() => setHoveredIndustry(i)} onMouseLeave={() => setHoveredIndustry(null)} style={{ position: "relative", borderRadius: 20, padding: "36px 24px 28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", transition: "all 0.35s", transform: hoveredIndustry === i ? "translateY(-6px)" : "none", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: ind.bg, opacity: hoveredIndustry === i ? 1 : 0.3, transition: "opacity 0.3s" }} />
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{ind.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{ind.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(15,23,42,0.65)", lineHeight: 1.7, letterSpacing: 0.3 }}>{ind.desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───── S4: 产品选择 ───── */}
        <section style={{ padding: "100px 20px", maxWidth: 1200, margin: "0 auto" }}>
          <Reveal><SectionTitle tag="产品矩阵" title="总有一款适合你的企业" subtitle="从个体户到成长型企业，星辰产品家族为每个阶段量身打造" /></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "stretch" }}>
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <div style={{ position: "relative", borderRadius: 24, padding: "36px 32px 32px", background: p.highlighted ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${p.highlighted ? p.color + "30" : "rgba(255,255,255,0.06)"}`, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
                  <div style={{ position: "absolute", top: 20, right: 20, fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, background: p.color + "18", color: p.color, letterSpacing: 0.5 }}>{p.badge}</div>
                  {p.highlighted && <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${p.color}12, transparent 70%)`, pointerEvents: "none" }} />}
                  <div style={{ fontSize: 12, color: "rgba(55,65,81,0.9)", fontWeight: 600, marginBottom: 8 }}>{p.target}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(31,41,55,0.85)", lineHeight: 1.7, marginBottom: 20, flex: 1 }}>{p.desc}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {p.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: p.color + "18", color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: p.color, marginBottom: 20 }}>{p.price}</div>
                  <div onClick={() => openAuthModal()} style={{ textAlign: "center", padding: "12px 0", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.25s", background: p.highlighted ? `linear-gradient(135deg, ${p.color}, ${p.color}cc)` : "#f3f4f6", color: p.highlighted ? "#060a12" : "#111827", border: `1px solid ${p.highlighted ? "transparent" : "#e5e7eb"}` }}>
                    {p.highlighted ? "立即体验" : "了解更多"}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───── S5: 用户案例 ───── */}
        <section style={{ padding: "100px 20px", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, rgba(0,228,160,0.015) 30%, rgba(0,228,160,0.015) 70%, transparent)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
            <Reveal><SectionTitle tag="客户心声" title="10,000+ 中小企业的共同选择" subtitle="来自真实客户的一线反馈" /></Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
              {CASES.map((c, i) => (
                <Reveal key={c.company} delay={i * 0.1}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "32px 28px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: c.color, opacity: 0.6 }} />
                    <div style={{ fontSize: 40, color: c.color, opacity: 0.15, fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: -8 }}>"</div>
                    <p style={{ fontSize: 15, color: "rgba(15,23,42,0.85)", lineHeight: 1.8, margin: "0 0 24px" }}>{c.quote}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.color + "20", color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>{c.avatar}</div>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{c.company}</div><div style={{ fontSize: 12, color: "rgba(75,85,99,0.9)" }}>{c.industry}</div></div>
                      </div>
                      <div style={{ padding: "6px 16px", borderRadius: 20, background: c.color + "12", fontSize: 13, fontWeight: 700, color: c.color }}>{c.metric}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───── S6: 市场活动 ───── */}
        <section style={{ padding: "100px 20px 120px", maxWidth: 1200, margin: "0 auto" }}>
          <Reveal><SectionTitle tag="市场动态" title="最新活动与资讯" subtitle="关注星辰 AI 最新动态，不错过任何机会" /></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {EVENTS.map((ev, i) => (
              <Reveal key={ev.title} delay={i * 0.08}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px 28px 24px", cursor: "pointer", transition: "all 0.3s", position: "relative", overflow: "hidden" }}>
                  {ev.hot && <div style={{ position: "absolute", top: 16, right: 16, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: "rgba(255,107,138,0.15)", color: "#ff6b8a" }}>HOT</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 8, background: "rgba(99,182,255,0.1)", color: "#2563eb" }}>{ev.tag}</span>
                    <span style={{ fontSize: 12, color: "rgba(107,114,128,0.9)" }}>{ev.date}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8, lineHeight: 1.4 }}>{ev.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(31,41,55,0.8)", lineHeight: 1.7 }}>{ev.desc}</div>
                  <div style={{ marginTop: 18, fontSize: 13, fontWeight: 600, color: "#63b6ff", display: "flex", alignItems: "center", gap: 4 }}>了解详情 <span>→</span></div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───── Footer ───── */}
        <footer style={{ borderTop: "1px solid #e5e7eb", padding: "48px 20px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>✦</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>星辰 AI</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(75,85,99,0.95)", maxWidth: 280, lineHeight: 1.7 }}>AI 原生 ERP，为中小企业而生。让每一家小企业都拥有世界级的管理能力。</div>
            </div>
            {[
              { title: "产品", links: ["星辰 ERP", "精斗云", "账无忧", "价格方案"] },
              { title: "解决方案", links: ["食品饮料", "家电数码", "五金配件", "更多行业"] },
              { title: "资源", links: ["帮助中心", "开发者文档", "API", "社区论坛"] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 16 }}>{col.title}</div>
                {col.links.map((l) => <div key={l} style={{ fontSize: 13, color: "rgba(55,65,81,0.95)", marginBottom: 10, cursor: "pointer" }}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e7eb", textAlign: "center", fontSize: 12, color: "#9ca3af" }}>© 2026 星辰 AI · 粤ICP备XXXXXXXX号 · 隐私政策 · 用户协议</div>
        </footer>

        <div style={{ position: "fixed", bottom: 20, right: 20, fontSize: 13, color: "rgba(255,255,255,0.4)", cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: 20, zIndex: 100, backdropFilter: "blur(8px)" }}>🌐 中文</div>
        </div>
        {/* 注册/登录弹窗：根据地区选择登录方式 */}
        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onStart={doStartOnboarding}
        />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  CELEBRATE
  // ═══════════════════════════════════════════════════════
  if (celebrating && phase !== "dashboard") {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 40%, #0f2847, #060a12)", color: "#fff", fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <style>{globalCSS}</style>
        <div style={{ animation: "scaleIn 0.6s ease-out" }}><PulseRing size={180} /></div>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginTop: 32, background: "linear-gradient(135deg, #fff 30%, #63b6ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "fadeUp 0.8s ease-out 0.3s both" }}>你的专属星辰已就绪 🎉</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", animation: "fadeUp 0.8s ease-out 0.6s both" }}>正在生成个性化管理面板...</p>
        <div style={{ marginTop: 32, width: 300, animation: "fadeUp 0.8s ease-out 0.9s both" }}><ProgressBar pct={100} /></div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  DASHBOARD（产品界面：参考金蝶小蝶布局）
  // ═══════════════════════════════════════════════════════
  if (phase === "dashboard") {
    return (
      <div style={{ minHeight: "100vh", background: "#fafafa", color: "#111827", fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif", display: "flex" }}>
        <style>{globalCSS}</style>
        {/* 左侧边栏：品牌 + 新建 + Agent 列表 */}
        <div style={{ width: sidebarCollapsed ? 72 : 240, minWidth: sidebarCollapsed ? 72 : 240, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.25s ease" }}>
          <div style={{ height: 56, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderBottom: "1px solid #e5e7eb" }}>
            <img src="assets/kingdee-ai-logo.png" alt="金蝶 AI" style={{ height: 32, width: "auto", display: "block", background: "transparent", objectFit: "contain" }} />
            {!sidebarCollapsed && (
              <>
                <span style={{ fontSize: 12, color: "#9ca3af", cursor: "pointer", marginLeft: 4 }}>▾</span>
              </>
            )}
          </div>
          <div style={{ padding: "12px 16px" }}>
            <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(41,113,235,0.25)", background: "rgba(41,113,235,0.06)", color: "rgb(41,113,235)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 16 }}>+</span>
              {!sidebarCollapsed && <span>新建</span>}
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {AGENTS.map((a, i) => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", margin: "2px 8px", borderRadius: 10, cursor: "pointer", background: activeModule === a.name ? "rgba(41,113,235,0.08)" : "transparent", color: activeModule === a.name ? "rgb(41,113,235)" : "#374151", transition: "all 0.2s" }} onMouseEnter={() => setHoveredAgent(i)} onMouseLeave={() => setHoveredAgent(null)} onClick={() => setActiveModule(a.name)}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: (hoveredAgent === i || activeModule === a.name) ? a.color + "20" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
                {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</span>}
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, cursor: "pointer", color: "#6b7280", fontSize: 12 }} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <span>{sidebarCollapsed ? "→" : "←"}</span>
              {!sidebarCollapsed && <span>收起</span>}
            </div>
          </div>
        </div>

        {/* 主区域 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fafafa" }}>
          {/* 顶栏 */}
          <div style={{ height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 20, height: 20, cursor: "pointer", color: "#6b7280", fontSize: 18 }}>☰</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{SAMPLE_COMPANY_NAME}</span>
              <span style={{ fontSize: 14, color: "#9ca3af", cursor: "pointer" }}>ⓘ</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ cursor: "pointer", color: "#6b7280", fontSize: 18 }}>🔍</span>
              <div style={{ position: "relative" }}>
                <span onClick={() => setShowExpandMenu((v) => !v)} style={{ cursor: "pointer", color: "#6b7280", fontSize: 18 }}>⊞</span>
                {showExpandMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setShowExpandMenu(false)} aria-hidden="true" />
                    <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 6, minWidth: 180, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 51, padding: "8px 0", overflow: "hidden" }}>
                      <a href="#subscription" onClick={() => setShowExpandMenu(false)} style={{ display: "block", padding: "10px 16px", fontSize: 14, color: "#374151", textDecoration: "none", cursor: "pointer" }}>查看订阅订单</a>
                      <a href="#payment" onClick={() => setShowExpandMenu(false)} style={{ display: "block", padding: "10px 16px", fontSize: 14, color: "#374151", textDecoration: "none", cursor: "pointer" }}>支付方式</a>
                      <a href="#history" onClick={() => setShowExpandMenu(false)} style={{ display: "block", padding: "10px 16px", fontSize: 14, color: "#374151", textDecoration: "none", cursor: "pointer" }}>交易历史</a>
                    </div>
                  </>
                )}
              </div>
              <span style={{ cursor: "pointer", color: "#6b7280", fontSize: 18 }}>⚙</span>
              <span style={{ cursor: "pointer", color: "#6b7280", fontSize: 16 }}>?</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, rgb(41,113,235), #4f8df5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>张</div>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", marginTop: -12, marginLeft: -4 }} />
                <span style={{ fontSize: 12, color: "#6b7280" }}>▾</span>
              </div>
            </div>
          </div>

          {/* 主内容区 */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", position: "relative" }}>
            {/* 试用期提示条（可关闭，点击进入升级页） */}
            {!trialBannerDismissed && (
              <div onClick={() => setShowUpgradeModal(true)} style={{ position: "absolute", top: 24, right: 28, maxWidth: 420, padding: "14px 18px", background: "#eff6ff", border: "1px solid rgba(41,113,235,0.25)", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 12, animation: dashReady ? "fadeUp 0.5s ease-out both" : "none", zIndex: 10, cursor: "pointer" }}>
                <span style={{ fontSize: 20 }}>📅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", marginBottom: 4 }}>你还剩 30 天免费试用期</div>
                  <div style={{ fontSize: 12, color: "#3b82f6", opacity: 0.9 }}>试用期结束后，将自动降级为标准版本并提示购买</div>
                </div>
                <span style={{ cursor: "pointer", color: "#6b7280", fontSize: 14 }} onClick={(e) => { e.stopPropagation(); setTrialBannerDismissed(true); }}>×</span>
              </div>
            )}

            <div style={{ maxWidth: 800, margin: "0 auto", paddingTop: 24 }}>
              {/* 欢迎区：头像 + 文案 */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, animation: dashReady ? "fadeUp 0.5s ease-out 0.1s both" : "none" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, rgba(41,113,235,0.2), rgba(79,141,245,0.15))", border: "2px solid rgba(41,113,235,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>✦</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>你好，我是星辰</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>你的智能经营助手，随时为你效劳</div>
                </div>
              </div>

              {/* 快捷操作芯片 */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, animation: dashReady ? "fadeUp 0.5s ease-out 0.2s both" : "none" }}>
                {DASHBOARD_QUICK_ACTIONS.map((q, i) => (
                  <button key={q.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                    <span style={{ fontSize: 16 }}>{q.icon}</span>
                    {q.label}
                  </button>
                ))}
              </div>

              {/* 搜索/提问输入框 */}
              <div style={{ marginBottom: 24, animation: dashReady ? "fadeUp 0.5s ease-out 0.25s both" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: 18, color: "#9ca3af", marginRight: 12 }}>🔍</span>
                  <input type="text" placeholder="搜索或向星辰提问..." style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }} />
                  <span style={{ fontSize: 18, color: "rgb(41,113,235)", cursor: "pointer" }}>✈</span>
                </div>
              </div>

              {/* 标签：任务 | 业务提效 */}
              <div style={{ display: "flex", gap: 24, marginBottom: 20, borderBottom: "1px solid #e5e7eb", animation: dashReady ? "fadeUp 0.5s ease-out 0.3s both" : "none" }}>
                {["任务", "业务提效"].map((t) => (
                  <button key={t} onClick={() => setDashboardTab(t)} style={{ padding: "12px 0", fontSize: 14, fontWeight: 600, color: dashboardTab === t ? "rgb(41,113,235)" : "#6b7280", border: "none", borderBottom: dashboardTab === t ? "2px solid rgb(41,113,235)" : "2px solid transparent", background: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: -1 }}>
                    {t}
                  </button>
                ))}
              </div>

              {/* 三张卡片 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, animation: dashReady ? "fadeUp 0.5s ease-out 0.4s both" : "none" }}>
                {DASHBOARD_CARDS.map((c, i) => (
                  <div key={c.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "flex-start", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "all 0.2s", cursor: "pointer" }}>
                    <div style={{ fontSize: 32, marginBottom: 16 }}>{c.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 10, lineHeight: 1.4 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{c.desc}</div>
                    <button style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "rgb(41,113,235)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{c.btn}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 升级弹窗（白蓝风格，与产品一致） */}
        {showUpgradeModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", cursor: "pointer" }} onClick={() => setShowUpgradeModal(false)} aria-hidden />
            <div style={{ position: "relative", maxWidth: 1100, width: "100%", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 20, padding: "40px 32px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(41,113,235,0.12)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#111827" }}>升级到 星辰 Pro</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, color: billingCycle === "monthly" ? "#111827" : "#6b7280" }}>月付</span>
                  <button onClick={() => setBillingCycle((c) => (c === "monthly" ? "annual" : "monthly"))} style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: billingCycle === "annual" ? "rgb(41,113,235)" : "rgba(41,113,235,0.2)", cursor: "pointer", position: "relative" }}>
                    <div style={{ position: "absolute", top: 2, left: billingCycle === "monthly" ? 2 : 22, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </button>
                  <span style={{ fontSize: 14, color: billingCycle === "annual" ? "#111827" : "#6b7280" }}>年付 - 节省 17%</span>
                </div>
                <button onClick={() => setShowUpgradeModal(false)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer", padding: 4 }} aria-label="关闭">×</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
                {UPGRADE_PLANS.map((plan) => (
                  <div key={plan.id} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: plan.highlighted ? "2px solid rgb(41,113,235)" : "1px solid #e5e7eb", position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    {plan.badge && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, background: "rgb(41,113,235)", color: "#fff" }}>{plan.badge}</div>}
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>{plan.billingLabel}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>{billingCycle === "annual" ? `${plan.priceYearly} / 年` : plan.priceDaily ? `${plan.priceDaily} / 日` : `${plan.priceMonthly} / 月`}</div>
                    <div style={{ fontSize: 13, color: "#374151", marginBottom: 20 }}>{plan.description}</div>
                    {plan.customOption && <div style={{ marginBottom: 20, padding: "10px 14px", background: "#f3f4f6", borderRadius: 10, fontSize: 13, color: "#374151", display: "flex", alignItems: "center", justifyContent: "space-between" }}>{plan.customOption}<span style={{ fontSize: 12, color: "#9ca3af" }}>▾</span></div>}
                    <button onClick={() => { if (plan.highlighted && plan.buttonText.includes("试用")) { setShowUpgradeModal(false); openAuthModal(); } else setShowUpgradeModal(false); }} style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: plan.highlighted ? "rgb(41,113,235)" : "#111827", color: "#fff", marginBottom: 24 }}>{plan.buttonText}</button>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{plan.features.map((f, i) => <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#374151", marginBottom: 12 }}><span style={{ color: "rgb(41,113,235)", fontSize: 16 }}>✓</span>{f}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <div><div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>星辰 团队企业计划</div><div style={{ fontSize: 13, color: "#6b7280" }}>面向中小型团队及行业标准认证。</div></div>
                  <span style={{ fontSize: 14, color: "rgb(41,113,235)", cursor: "pointer" }}>了解更多 →</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 0" }}>
                  <div><div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>安全与合规</div><div style={{ fontSize: 13, color: "#6b7280" }}>您的数据安全受保护。了解更多。</div></div>
                  <span style={{ fontSize: 14, color: "rgb(41,113,235)", cursor: "pointer" }}>了解更多 →</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  DISCOVER（了解星辰AI 分支：对话 + 视频/图片）
  // ═══════════════════════════════════════════════════════
  if (phase === "discover") {
    const currentDiscoverStep = step < DISCOVER_STEPS.length ? DISCOVER_STEPS[step] : null;
    const lastIsAi = messages.length > 0 && messages[messages.length - 1].role === "ai";
    return (
      <>
        <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827", fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif" }}>
          <style>{globalCSS}</style>
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", paddingTop: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20, background: "linear-gradient(180deg, rgba(41,113,235,0.03) 0%, transparent 12%)" }}>
              {messages.map((m, i) => (
                <div key={i}>
                  <div style={m.role === "user" ? { display: "flex", justifyContent: "flex-end", animation: "fadeUp 0.3s ease-out" } : { display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeUp 0.4s ease-out" }}>
                    {m.role === "ai" && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(41,113,235,0.2), rgba(79,141,245,0.15))", border: "1px solid rgba(41,113,235,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 16px rgba(41,113,235,0.2)" }}>✦</div>
                        <span style={{ fontSize: 12, color: "rgba(17,24,39,0.6)", fontWeight: 600 }}>星辰</span>
                      </div>
                    )}
                    <div style={m.role === "user" ? { maxWidth: "70%", padding: "14px 20px", borderRadius: "20px 6px 20px 20px", background: "linear-gradient(135deg, rgb(41,113,235), #4f8df5)", border: "1px solid rgba(41,113,235,0.3)", fontSize: 15, lineHeight: 1.65, color: "#fff", boxShadow: "0 2px 12px rgba(41,113,235,0.25)" } : { maxWidth: "85%", padding: "14px 20px", borderRadius: "6px 20px 20px 20px", background: "#f3f6ff", border: "1px solid rgba(41,113,235,0.16)", fontSize: 15, lineHeight: 1.75, color: "rgba(17,24,39,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      {m.role === "ai" ? <TypeWriter text={m.text} speed={20} /> : m.text}
                    </div>
                  </div>
                  {m.role === "ai" && m.media && (
                    <div style={{ marginLeft: 52, marginTop: 12, marginBottom: 8, animation: "fadeUp 0.4s ease-out" }}>
                      {m.media.type === "video" ? (
                        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(41,113,235,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                          <video src={m.media.url} controls style={{ width: "100%", maxWidth: 560, display: "block" }} />
                          {m.media.caption && <div style={{ padding: "10px 14px", fontSize: 12, color: "rgba(17,24,39,0.55)", background: "#f9fafb" }}>{m.media.caption}</div>}
                        </div>
                      ) : (
                        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(41,113,235,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                          <img src={m.media.url} alt={m.media.caption || ""} style={{ width: "100%", maxWidth: 560, display: "block" }} />
                          {m.media.caption && <div style={{ padding: "10px 14px", fontSize: 12, color: "rgba(17,24,39,0.55)", background: "#f9fafb" }}>{m.media.caption}</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(41,113,235,0.15), rgba(79,141,245,0.1))", border: "1px solid rgba(41,113,235,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
                    <span style={{ fontSize: 12, color: "rgba(17,24,39,0.6)", fontWeight: 600 }}>星辰</span>
                  </div>
                  <div style={{ padding: "14px 20px", borderRadius: "6px 20px 20px 20px", background: "#f3f6ff", border: "1px solid rgba(41,113,235,0.12)" }}>
                    <span style={{ fontSize: 13, color: "rgba(17,24,39,0.55)" }}>正在想呢...</span>
                    <span style={{ fontSize: 22, letterSpacing: 2, color: "rgba(41,113,235,0.7)", marginLeft: 4 }}><span style={{ animation: "blink 1s 0s infinite" }}>·</span><span style={{ animation: "blink 1s 0.2s infinite" }}>·</span><span style={{ animation: "blink 1s 0.4s infinite" }}>·</span></span>
                  </div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            {currentDiscoverStep && !typing && lastIsAi && (
              <div style={{ padding: "16px 28px 24px", borderTop: "1px solid rgba(41,113,235,0.1)", background: "#f9fafb" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "rgba(17,24,39,0.5)", flexShrink: 0 }}>选择下一步：</span>
                  {currentDiscoverStep.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleDiscoverOption(opt)}
                      style={{ padding: "10px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500, background: opt === "免费试用" ? "linear-gradient(135deg, rgb(41,113,235), #4f8df5)" : "rgba(41,113,235,0.06)", border: opt === "免费试用" ? "none" : "1px solid rgba(41,113,235,0.2)", color: opt === "免费试用" ? "#fff" : "rgb(41,113,235)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: opt === "免费试用" ? "0 2px 8px rgba(41,113,235,0.3)" : "none" }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
        </div>
        </div>
        {showAuthModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", cursor: "pointer" }} onClick={() => setShowAuthModal(false)} aria-hidden="true" />
            <div style={{ position: "relative", display: "flex", maxWidth: 440, width: "100%", background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", overflow: "hidden", border: "1px solid #e5e7eb" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 140, flexShrink: 0, background: "linear-gradient(180deg, rgba(41,113,235,0.08), rgba(41,113,235,0.02))", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <img src="assets/ai-avatar.png" alt="" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, padding: "32px 28px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                  <button onClick={() => setAuthTab("login")} style={{ padding: "8px 16px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: authTab === "login" ? "rgb(41,113,235)" : "transparent", color: authTab === "login" ? "#fff" : "#6b7280" }}>登录</button>
                  <button onClick={() => setAuthTab("register")} style={{ padding: "8px 16px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: authTab === "register" ? "rgb(41,113,235)" : "transparent", color: authTab === "register" ? "#fff" : "#6b7280" }}>注册</button>
                </div>
                {authTab === "login" ? (
                  <>
                    <input type="text" placeholder="手机号 / 邮箱" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, marginBottom: 12, fontFamily: "inherit", boxSizing: "border-box" }} />
                    <input type="password" placeholder="密码" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, marginBottom: 20, fontFamily: "inherit", boxSizing: "border-box" }} />
                  </>
                ) : (
                  <>
                    <input type="text" placeholder="手机号 / 邮箱" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, marginBottom: 12, fontFamily: "inherit", boxSizing: "border-box" }} />
                    <input type="password" placeholder="设置密码" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, marginBottom: 12, fontFamily: "inherit", boxSizing: "border-box" }} />
                    <input type="password" placeholder="确认密码" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, marginBottom: 20, fontFamily: "inherit", boxSizing: "border-box" }} />
                  </>
                )}
                <button onClick={() => doStartOnboarding("免费试用")} style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: "rgb(41,113,235)", color: "#fff" }}>{authTab === "login" ? "登录并开始" : "注册并开始"}</button>
                <button onClick={() => setShowAuthModal(false)} style={{ marginTop: 12, width: "100%", padding: "10px", border: "none", background: "none", fontSize: 13, color: "#9ca3af", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  ONBOARDING (Split-Screen)
  // ═══════════════════════════════════════════════════════
  const currentStep = step < ONBOARDING_STEPS.length ? ONBOARDING_STEPS[step] : null;
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827", fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif" }}>
      <style>{globalCSS}</style>
      <div style={{ display: "flex", height: "100vh", paddingTop: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(41,113,235,0.12)" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20, background: "linear-gradient(180deg, rgba(41,113,235,0.03) 0%, transparent 12%)" }}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user" ? { display: "flex", justifyContent: "flex-end", animation: "fadeUp 0.3s ease-out" } : { display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeUp 0.4s ease-out" }}>
                {m.role === "ai" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(41,113,235,0.2), rgba(79,141,245,0.15))", border: "1px solid rgba(41,113,235,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 16px rgba(41,113,235,0.2)" }}>✦</div>
                    <span style={{ fontSize: 12, color: "rgba(17,24,39,0.6)", fontWeight: 600 }}>星辰</span>
                  </div>
                )}
                <div style={m.role === "user" ? { maxWidth: "70%", padding: "14px 20px", borderRadius: "20px 6px 20px 20px", background: "linear-gradient(135deg, rgb(41,113,235), #4f8df5)", border: "1px solid rgba(41,113,235,0.3)", fontSize: 15, lineHeight: 1.65, color: "#fff", boxShadow: "0 2px 12px rgba(41,113,235,0.25)" } : { maxWidth: "80%", padding: "14px 20px", borderRadius: "6px 20px 20px 20px", background: "#f3f6ff", border: "1px solid rgba(41,113,235,0.16)", fontSize: 15, lineHeight: 1.75, color: "rgba(17,24,39,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  {m.role === "ai" ? <TypeWriter text={m.text} speed={20} /> : m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(41,113,235,0.15), rgba(79,141,245,0.1))", border: "1px solid rgba(41,113,235,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
                  <span style={{ fontSize: 12, color: "rgba(17,24,39,0.6)", fontWeight: 600 }}>星辰</span>
                </div>
                <div style={{ padding: "14px 20px", borderRadius: "6px 20px 20px 20px", background: "#f3f6ff", border: "1px solid rgba(41,113,235,0.12)" }}>
                  <span style={{ fontSize: 13, color: "rgba(17,24,39,0.55)" }}>正在想呢...</span>
                  <span style={{ fontSize: 22, letterSpacing: 2, color: "rgba(41,113,235,0.7)", marginLeft: 4 }}><span style={{ animation: "blink 1s 0s infinite" }}>·</span><span style={{ animation: "blink 1s 0.2s infinite" }}>·</span><span style={{ animation: "blink 1s 0.4s infinite" }}>·</span></span>
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>
          {currentStep && !typing && messages.length > 0 && messages[messages.length - 1].role === "ai" && (
            <div style={{ padding: "16px 28px 24px", borderTop: "1px solid rgba(41,113,235,0.1)", background: "#f9fafb" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16 }}>
                <textarea
                  value={onboardingInput}
                  onChange={(e) => setOnboardingInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendInput(); } }}
                  placeholder={currentStep.inputPlaceholder || "说说你的想法～"}
                  rows={currentStep.preferInput ? 3 : 2}
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: 16,
                    border: "1px solid rgba(41,113,235,0.2)",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: 15,
                    lineHeight: 1.6,
                    resize: "none",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSendInput}
                  disabled={!onboardingInput.trim()}
                  style={{
                    padding: "14px 24px",
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    background: onboardingInput.trim() ? "linear-gradient(135deg, rgb(41,113,235), #4f8df5)" : "rgba(17,24,39,0.06)",
                    border: onboardingInput.trim() ? "none" : "1px solid rgba(17,24,39,0.12)",
                    color: onboardingInput.trim() ? "#fff" : "rgba(17,24,39,0.4)",
                    cursor: onboardingInput.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  发送
                </button>
              </div>
              {!currentStep.preferInput && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "rgba(17,24,39,0.5)", flexShrink: 0 }}>快捷回复：</span>
                  {currentStep.options.map((opt) => (
                    <button key={opt} onClick={() => handleOption(opt)} style={{ padding: "10px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500, background: "rgba(41,113,235,0.06)", border: "1px solid rgba(41,113,235,0.2)", color: "rgb(41,113,235)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{opt}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {showAgent && (
          <div style={{ width: "42%", minWidth: 340, background: "#f9fafb", borderLeft: "1px solid rgba(41,113,235,0.1)", overflowY: "auto", animation: "slideInRight 0.6s ease-out" }}>
            <div style={{ padding: "32px 28px" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ display: "inline-block", animation: "floatY 3s ease-in-out infinite" }}><PulseRing size={90} /></div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 16, marginBottom: 4, background: "linear-gradient(135deg, #0f172a 0%, rgb(41,113,235) 50%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>你的专属星辰</h3>
                <p style={{ fontSize: 13, color: "rgba(17,24,39,0.6)", margin: 0 }}>根据你的回答，正在为你量身定制～</p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "rgba(17,24,39,0.55)" }}>了解你的进度</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(41,113,235)" }}>{Math.round(pct)}%</span>
                </div>
                <ProgressBar pct={pct} />
              </div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, color: "rgba(17,24,39,0.55)", marginBottom: 10 }}>已记下你的</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{AGENT_TAGS.map((t) => <TagPill key={t} label={t} active={activeTags.includes(t)} light />)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "rgba(17,24,39,0.55)", marginBottom: 10 }}>正在为你准备</div>
                {[
                  { label: "初始化记忆.md", desc: "企业画像与上下文记忆", threshold: 20 },
                  { label: "商品分类", desc: "行业商品目录结构", threshold: 40 },
                  { label: "经营难点", desc: "痛点与功能映射", threshold: 60 },
                  { label: "管理流程", desc: "工作流模板", threshold: 80 },
                  { label: "企业目标", desc: "OKR 与关键指标", threshold: 100 },
                ].map((a) => (
                  <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(17,24,39,0.06)", transition: "opacity 0.6s", opacity: pct >= a.threshold ? 1 : 0.4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: pct >= a.threshold ? "rgba(41,113,235,0.12)" : "rgba(17,24,39,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: pct >= a.threshold ? "rgb(41,113,235)" : "rgba(17,24,39,0.35)" }}>{pct >= a.threshold ? "✓" : "○"}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: pct >= a.threshold ? "#111827" : "rgba(17,24,39,0.45)" }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(17,24,39,0.5)" }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&family=Noto+Sans+SC:wght@400;500;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
  @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes fadeUp { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes slideInRight { 0% { opacity: 0; transform: translateX(40px); } 100% { opacity: 1; transform: translateX(0); } }
  @keyframes scaleIn { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
  @keyframes scrollDot { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(12px); opacity: 0; } }
  button:hover { background: rgba(99,182,255,0.18) !important; border-color: rgba(99,182,255,0.4) !important; transform: translateY(-1px); }
`;
