import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeDollarSign,
  Check,
  ChevronRight,
  CircleHelp,
  Coins,
  Copy,
  Flame,
  Gauge,
  Gift,
  Info,
  Landmark,
  LockKeyhole,
  Menu,
  Pickaxe,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Send,
  Target,
  UserRound,
  WalletCards,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

type View = 'home' | 'plans' | 'bonus' | 'mining' | 'profile';
type Notice = { title: string; detail?: string };

type NavItem = {
  id: View;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Gauge },
  { id: 'plans', label: 'Plans', icon: Landmark },
  { id: 'bonus', label: 'Bonus spin', icon: Gift },
  { id: 'mining', label: 'Earn', icon: Pickaxe },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

const plans = [
  { id: 'micro', amount: 3, simulated: 3, tag: 'Starter', description: 'A quick daily earning simulation.' },
  { id: 'starter', amount: 10, simulated: 8, tag: 'Warm up', description: 'A low-stakes way to learn the cockpit.' },
  { id: 'builder', amount: 50, simulated: 45, tag: 'Popular', description: 'A balanced one-month simulation.' },
  { id: 'accelerator', amount: 100, simulated: 90, tag: 'Steady', description: 'More runway for your points strategy.' },
  { id: 'moonshot', amount: 250, simulated: 480, tag: 'High variance', description: 'An intentionally bold demo scenario.' },
];

const earningPlans = [
  { planId: 'micro', amount: 3, ads: 5, perAd: 0.20, daily: 1 },
  { planId: 'starter', amount: 10, ads: 5, perAd: 0.40, daily: 2 },
  { planId: 'builder', amount: 50, ads: 5, perAd: 1, daily: 5 },
  { planId: 'accelerator', amount: 100, ads: 5, perAd: 2, daily: 10 },
  { planId: 'moonshot', amount: 250, ads: 5, perAd: 5, daily: 25 },
];

const leaderboard = [
  { name: 'Nora K.', points: 18940, initials: 'NK', color: 'hsl(37 88% 75%)' },
  { name: 'Milo R.', points: 17280, initials: 'MR', color: 'hsl(174 38% 76%)' },
  { name: 'You', points: 12480, initials: 'YA', color: 'hsl(225 35% 76%)' },
  { name: 'Priya S.', points: 11860, initials: 'PS', color: 'hsl(8 50% 80%)' },
];

function App() {
  const [view, setView] = useState<View>('home');
  const [score, setScore] = useState(12480);
  const [energy, setEnergy] = useState(78);
  const [tapFloats, setTapFloats] = useState<{ id: number; value: number; left: number }[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [activePlan, setActivePlan] = useState<string | null>('builder');
  const [spinAvailable, setSpinAvailable] = useState(true);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [miningDay, setMiningDay] = useState(6);
  const [swappedDollars, setSwappedDollars] = useState(4.25);
  const [swapInput, setSwapInput] = useState('');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [claimedAds, setClaimedAds] = useState<Record<string, number>>({});
  const [depositPlan, setDepositPlan] = useState<(typeof plans)[number] | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const level = Math.floor(score / 5000) + 1;
  const levelFloor = (level - 1) * 5000;
  const levelProgress = ((score - levelFloor) / 5000) * 100;
  const miningProgress = Math.min(100, (miningDay / 15) * 100);
  const miningReturn = (50 * 0.05 * (miningDay / 15)).toFixed(2);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const currentNav = useMemo(() => navItems.find((item) => item.id === view) ?? navItems[0], [view]);
  const showNotice = (title: string, detail?: string) => setNotice({ title, detail });

  const tap = () => {
    if (energy <= 0) {
      showNotice('Power is depleted', 'Come back after your next recharge window.');
      return;
    }
    const value = Math.floor(Math.random() * 10) + 7;
    const float = { id: Date.now(), value, left: 42 + Math.random() * 18 };
    setScore((current) => current + value);
    setEnergy((current) => Math.max(0, current - 3));
    setTapFloats((current) => [...current, float]);
    window.setTimeout(() => setTapFloats((current) => current.filter((item) => item.id !== float.id)), 820);
  };

  const recharge = () => {
    setEnergy(100);
    showNotice('Power recharged', 'Your demo tap meter is ready for another run.');
  };

  const activatePlan = (id: string) => {
    const chosen = plans.find((plan) => plan.id === id);
    if (chosen) {
      setActivePlan(id);
      setDepositPlan(chosen);
      setDepositSuccess(false);
    }
  };

  const spin = () => {
    if (!spinAvailable || spinning) return;
    setSpinning(true);
    setSpinResult(null);
    setSpinRotation((current) => current + 1440 + Math.floor(Math.random() * 360));
    window.setTimeout(() => {
      const rewards = ['250 points', '500 points', '$0.50 demo credit', '1,000 points', 'Extra power'];
      const result = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinResult(result);
      setSpinAvailable(false);
      setSpinning(false);
      if (result.includes('points')) {
        const points = Number(result.replace(/[^0-9]/g, ''));
        setScore((current) => current + points);
      }
      showNotice(`You unlocked ${result}`, 'Bonus outcome simulated locally.');
    }, 1050);
  };

  const checkInMining = () => {
    if (miningDay >= 15) {
      showNotice('Simulation complete', 'Your 15-day demo cycle has already been logged.');
      return;
    }
    setMiningDay((current) => current + 1);
    showNotice(`Day ${miningDay + 1} logged`, 'Your simulated mining timeline moved forward.');
  };

  const swapPoints = () => {
    const points = Number(swapInput);
    if (!points || points < 1000) {
      showNotice('Enter at least 1,000 points', 'The demo conversion is 1,000 points to $1.00.');
      return;
    }
    const dollars = points / 1000;
    if (points > score) {
      showNotice('Not enough points', 'Tap to collect more points before swapping.');
      return;
    }
    setScore((current) => current - points);
    setSwappedDollars((current) => current + dollars);
    setSwapInput('');
    showNotice(`Converted ${points.toLocaleString()} points`, `Added ${currency(dollars)} demo balance.`);
  };

  const submitWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!walletAddress.trim() || walletAddress.trim().length < 12) {
      showNotice('Check the wallet address', 'Enter a demo TRC20 address with at least 12 characters.');
      return;
    }
    if (!amount || amount <= 0 || amount > swappedDollars) {
      showNotice('Check the withdrawal amount', 'Amount must be within your demo balance.');
      return;
    }
    setSwappedDollars((current) => current - amount);
    setWithdrawOpen(false);
    setWithdrawAmount('');
    setWalletAddress('');
    showNotice('Demo withdrawal queued', 'No blockchain transaction was created.');
  };

  const claimAd = (planId: string) => {
    if (activePlan !== planId) {
      showNotice('Buy this plan first', 'Choose the matching plan in Plans to unlock daily ads.');
      return;
    }
    const earned = earningPlans.find((plan) => plan.planId === planId);
    const claimed = claimedAds[planId] ?? 0;
    if (!earned || claimed >= earned.ads) {
      showNotice('Daily ads complete', 'You have reached the five-ad limit for today.');
      return;
    }
    setClaimedAds((current) => ({ ...current, [planId]: claimed + 1 }));
    setSwappedDollars((current) => current + earned.perAd);
    showNotice(`Ad ${claimed + 1} completed`, `Added $${earned.perAd.toFixed(2)} demo earnings.`);
  };

  return (
    <div className="app-shell grain">
      <div className="flex min-h-[100dvh]">
        <aside className="sidebar">
          <div className="flex items-center gap-3 px-3">
            <div className="brand-mark">I</div>
            <span className="brand-type">investly</span>
          </div>
          <div className="mt-14 px-3">
            <p className="eyebrow !text-[#75cec1]">Your cockpit</p>
            <p className="mt-2 text-xs leading-5 text-white/45">Play the loop. Learn the rhythm. Track every move.</p>
          </div>
          <nav className="mt-8 space-y-2" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavButton key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.05] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[.12em] text-white/45">Current run</span>
              <Flame size={14} className="text-[#f5ba4d]" />
            </div>
            <p className="font-display text-2xl font-bold tracking-[-.06em]">6 days</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">Keep checking in to protect your streak.</p>
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-white/10 px-3 pt-5">
            <div className="avatar !border-[#2b3d4a]">YA</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">You, explorer</p>
              <p className="font-mono-app text-[10px] text-white/45">level {level}</p>
            </div>
            <button className="ml-auto rounded-md p-1 text-white/50 hover:text-white" aria-label="Open menu" data-testid="button-open-menu" onClick={() => setView('profile')}>
              <Menu size={16} />
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="topbar">
            <div>
              <p className="eyebrow">{currentNav.label}</p>
              <h1 className="display-title mt-1 text-2xl font-bold">{pageHeading(view)}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="status-pill hidden sm:inline-flex"><span className="status-dot" /> local simulation</span>
              <button className="avatar" aria-label="Open profile" data-testid="button-header-profile" onClick={() => setView('profile')}>YA</button>
            </div>
          </header>

          <main className="content-wrap">
            {view === 'home' && <HomePage score={score} energy={energy} level={level} levelFloor={levelFloor} levelProgress={levelProgress} tapFloats={tapFloats} onTap={tap} onRecharge={recharge} onNavigate={setView} />}
            {view === 'plans' && <PlansPage activePlan={activePlan} onActivate={activatePlan} />}
            {view === 'bonus' && <BonusPage available={spinAvailable} spinning={spinning} rotation={spinRotation} result={spinResult} onSpin={spin} />}
            {view === 'mining' && <EarnPage activePlan={activePlan} claimedAds={claimedAds} onClaimAd={claimAd} day={miningDay} progress={miningProgress} onCheckIn={checkInMining} />}
            {view === 'profile' && <ProfilePage score={score} dollars={swappedDollars} swapInput={swapInput} setSwapInput={setSwapInput} onSwap={swapPoints} onWithdraw={() => setWithdrawOpen(true)} activePlan={activePlan} claimedAds={claimedAds} onClaimAd={claimAd} day={miningDay} progress={miningProgress} onCheckIn={checkInMining} />}
          </main>
        </div>
      </div>
      <div className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />)}
      </div>
      {notice && <div className="toast-note"><p className="font-bold">{notice.title}</p>{notice.detail && <p className="mt-1 text-white/55">{notice.detail}</p>}</div>}
      {withdrawOpen && <WithdrawModal amount={withdrawAmount} address={walletAddress} setAmount={setWithdrawAmount} setAddress={setWalletAddress} onClose={() => setWithdrawOpen(false)} onSubmit={submitWithdraw} />}
      {depositPlan && <DepositModal plan={depositPlan} success={depositSuccess} onGetIt={() => { setDepositSuccess(true); showNotice('Deposit request marked successful', 'Simulation only. No funds were moved.'); }} onClose={() => { setDepositPlan(null); setDepositSuccess(false); }} />}
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} data-testid={`button-nav-${item.id}`} aria-current={active ? 'page' : undefined}><Icon size={17} strokeWidth={active ? 2.4 : 1.8} /><span className="nav-label">{item.label}</span></button>;
}

function HomePage({ score, energy, level, levelFloor, levelProgress, tapFloats, onTap, onRecharge, onNavigate }: { score: number; energy: number; level: number; levelFloor: number; levelProgress: number; tapFloats: { id: number; value: number; left: number }[]; onTap: () => void; onRecharge: () => void; onNavigate: (view: View) => void }) {
  return (
    <div className="space-y-6">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="flex items-center gap-2"><span className="eyebrow !text-[#75cec1]">Saturday, 08 June</span><span className="h-1 w-1 rounded-full bg-[#f5ba4d]" /></div>
          <h2 className="hero-heading mt-5">Small moves.<br /><span className="hero-number">Visible progress.</span></h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/55">Your rewards cockpit for a simulated investing playground. Tap, test plans, and build a streak — with no real money involved.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="btn-accent" data-testid="button-hero-tap" onClick={onTap}><Zap size={15} fill="currentColor" /> Tap to earn</button>
            <button className="btn-quiet !bg-white/10 !text-white" data-testid="button-hero-plans" onClick={() => onNavigate('plans')}>Explore plans <ArrowRight size={15} /></button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total points" value={score.toLocaleString()} detail="+840 this week" icon={Star} />
        <MetricCard label="Demo balance" value="$4.25" detail="Available to simulate" icon={WalletCards} />
        <MetricCard label="Current level" value={`Level ${level}`} detail={`${Math.max(0, Math.round(levelProgress))}% to next`} icon={Target} />
        <MetricCard label="Mining cycle" value="Day 06 / 15" detail="5% simulated return" icon={Pickaxe} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="card-surface rounded-[20px] p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div><p className="eyebrow">Daily loop</p><h2 className="section-title mt-2">Tap the signal</h2><p className="muted mt-1 text-xs">Each tap adds variable points and uses 3 power.</p></div>
            <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))] px-2.5 py-2"><Zap size={14} className="text-[hsl(var(--accent-foreground))]" fill="hsl(var(--accent))" /><span className="font-mono-app text-xs font-medium">{energy}%</span></div>
          </div>
          <div className="tap-stage mt-5">
            {tapFloats.map((float) => <span key={float.id} className="tap-float" style={{ left: `${float.left}%`, top: '43%' }}>+{float.value}</span>)}
            <button className="tap-orb" onClick={onTap} aria-label="Tap to collect points" data-testid="button-tap-earn">
              <span className="tap-orb-inner"><span className="tap-word">TAP</span></span>
            </button>
          </div>
          <div className="mt-5 flex items-center justify-between"><div><p className="font-mono-app text-xs text-[hsl(var(--muted-foreground))]">{energy} / 100 power</p><div className="progress-track mt-2 w-40"><div className="progress-fill gold" style={{ width: `${energy}%` }} /></div></div><button className="btn-quiet" onClick={onRecharge} data-testid="button-recharge-power"><RefreshCw size={14} /> Recharge demo</button></div>
        </div>

        <div className="card-surface rounded-[20px] p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><p className="eyebrow">Your climb</p><h2 className="section-title mt-2">Level {level} explorer</h2></div><span className="sim-chip">active</span></div>
          <div className="mt-7 flex items-end justify-between"><div><p className="font-display text-4xl font-bold tracking-[-.07em]">{score.toLocaleString()}</p><p className="muted mt-1 text-xs">points collected</p></div><p className="font-mono-app text-xs text-[hsl(var(--primary))]">{Math.round(levelProgress)}%</p></div>
          <div className="progress-track mt-4"><div className="progress-fill" style={{ width: `${levelProgress}%` }} /></div>
          <div className="mt-3 flex justify-between text-[11px] muted"><span>{levelFloor.toLocaleString()} pts</span><span>{(levelFloor + 5000).toLocaleString()} pts</span></div>
          <div className="mt-8 rounded-xl bg-[hsl(var(--muted))] p-4"><div className="flex items-center gap-2"><ShieldCheck size={15} className="text-[hsl(var(--primary))]" /><span className="text-xs font-bold">Consistency unlocks more</span></div><p className="muted mt-2 text-xs leading-5">Play daily to improve your place on the weekly board.</p></div>
        </div>
      </section>

      <section className="card-surface rounded-[20px] p-5 sm:p-6">
        <div className="flex items-center justify-between"><div><p className="eyebrow">Weekly board</p><h2 className="section-title mt-2">Your circle</h2></div><button className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]" onClick={() => onNavigate('profile')} data-testid="button-view-profile">View profile <ChevronRight size={14} /></button></div>
        <div className="mt-3 grid gap-x-10 md:grid-cols-2">{leaderboard.map((user, index) => <div className="leader-row" key={user.name}><span className={`rank ${index === 0 ? 'top' : ''}`}>{index + 1}</span><div className="flex items-center gap-2.5"><span className="leader-avatar" style={{ background: user.color }}>{user.initials}</span><span className="text-xs font-bold">{user.name}</span></div><span className="font-mono-app text-[11px] text-[hsl(var(--muted-foreground))]">{user.points.toLocaleString()}</span></div>)}</div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return <div className="metric-card card-surface"><div className="flex items-center justify-between"><span className="eyebrow">{label}</span><Icon size={16} className="text-[hsl(var(--primary))]" /></div><p className="metric-value">{value}</p><p className="muted mt-1 text-[11px]">{detail}</p></div>;
}

function PlansPage({ activePlan, onActivate }: { activePlan: string | null; onActivate: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="hero-panel"><div className="hero-copy"><p className="eyebrow !text-[#75cec1]">One-month sandbox</p><h2 className="hero-heading mt-4">Try a scenario.<br /><span className="hero-number">Keep the lesson.</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Plans are fictional deposit experiments. They help you compare timelines and outcomes — they are not offers, advice, or guaranteed returns.</p></div></div>
      <div className="flex items-end justify-between"><div><p className="eyebrow">Choose your scenario</p><h2 className="section-title mt-2">Simulated plans</h2></div><span className="sim-chip">30 day timing</span></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => <PlanCard key={plan.id} plan={plan} active={activePlan === plan.id} onActivate={() => onActivate(plan.id)} />)}
      </div>
      <div className="card-surface flex gap-3 rounded-2xl p-4"><Info size={17} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" /><div><p className="text-xs font-bold">Read this before you play</p><p className="muted mt-1 text-xs leading-5">All amounts on Investly are simulated values. A displayed outcome is simply part of the game scenario and does not predict or represent real investment performance.</p></div></div>
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div className="card-surface rounded-[20px] p-5 sm:p-6"><p className="eyebrow">Plan pulse</p><h2 className="section-title mt-2">Compare the curve</h2><div className="mt-6 flex h-40 items-end gap-4 border-b border-[hsl(var(--border))] px-2">{plans.map((plan, index) => <div className="flex flex-1 flex-col items-center gap-2" key={plan.id}><div className={`w-full max-w-[48px] rounded-t-lg ${index === 3 ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--primary))]'}`} style={{ height: `${Math.max(24, (plan.simulated / 480) * 125)}px` }} /><span className="font-mono-app text-[10px] text-[hsl(var(--muted-foreground))]">${plan.amount}</span></div>)}</div></div><div className="card-surface rounded-[20px] p-5 sm:p-6"><p className="eyebrow">Your active scenario</p>{activePlan ? <><h2 className="section-title mt-2">{plans.find((plan) => plan.id === activePlan)?.tag} plan is staged</h2><p className="muted mt-2 text-xs leading-5">This one-month timer is represented visually in your local session. Resetting the page resets your simulation.</p><div className="mt-5 flex items-center gap-3 rounded-xl bg-[hsl(var(--muted))] p-3"><Check size={17} className="text-[hsl(var(--primary))]" /><span className="text-xs font-bold">Simulation ready to explore</span></div></> : <EmptyState icon={Landmark} title="No scenario staged" detail="Pick a plan above to begin." />}</div></div>
    </div>
  );
}

function PlanCard({ plan, active, onActivate }: { plan: typeof plans[number]; active: boolean; onActivate: () => void }) {
  return <div className={`plan-card card-surface ${plan.id === 'moonshot' ? 'featured' : ''}`}><div className="flex items-center justify-between"><span className="eyebrow">{plan.tag}</span><span className="sim-chip">30 days</span></div><p className="mt-6 text-xs font-bold opacity-65">Simulate</p><p className="plan-amount mt-1">${plan.amount}</p><div className="my-5 flex items-center gap-2"><ArrowRight size={14} className="opacity-45" /><div><p className="text-xs font-bold">Scenario result</p><p className="text-xl font-bold text-[hsl(var(--accent))]">${plan.simulated}</p></div></div><p className="muted min-h-10 text-xs leading-5">{plan.description}</p><button className={active ? 'btn-quiet mt-5 w-full' : 'btn-primary mt-5 w-full'} onClick={onActivate} data-testid={`button-plan-${plan.id}`}>{active ? <><Check size={14} /> Staged</> : <>Stage scenario <ArrowRight size={14} /></>}</button></div>;
}

function DepositModal({ plan, success, onGetIt, onClose }: { plan: typeof plans[number]; success: boolean; onGetIt: () => void; onClose: () => void }) {
  const depositAddress = 'TX9yDemoInvestlyWallet7GATEIT';
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="deposit-title">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Deposit simulation</p>
            <h2 id="deposit-title" className="section-title mt-2">${plan.amount} {plan.tag} plan</h2>
          </div>
          <button className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" onClick={onClose} aria-label="Close deposit modal" data-testid="button-close-deposit"><X size={17} /></button>
        </div>
        <p className="muted mt-4 text-xs leading-5">Send the demo amount to the address below, then press “Gate it” to complete this simulated deposit flow.</p>
        <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
          <p className="eyebrow">TRC20 deposit address</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all text-xs font-bold leading-5">{depositAddress}</code>
            <button className="rounded-lg p-2 text-[hsl(var(--primary))] hover:bg-white/60" onClick={() => navigator.clipboard?.writeText(depositAddress)} aria-label="Copy deposit address" data-testid="button-copy-deposit"><Copy size={15} /></button>
          </div>
        </div>
        {success && <div className="mt-4 flex items-center gap-2 rounded-xl border border-[rgba(38,145,137,.25)] bg-[rgba(38,145,137,.1)] p-3 text-xs font-bold text-[hsl(var(--primary))]" role="status"><Check size={15} /> success</div>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <a className="btn-quiet" href="https://t.me/investly_support" target="_blank" rel="noreferrer" data-testid="link-support-admin"><Send size={14} /> Support Admin</a>
          <button className="btn-primary" onClick={onGetIt} disabled={success} data-testid="button-gate-it">{success ? <><Check size={14} /> success</> : <>Gate it <ArrowRight size={14} /></>}</button>
        </div>
      </div>
    </div>
  );
}

function BonusPage({ available, spinning, rotation, result, onSpin }: { available: boolean; spinning: boolean; rotation: number; result: string | null; onSpin: () => void }) {
  return <div className="space-y-6"><div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]"><div className="card-surface flex min-h-[465px] flex-col items-center justify-center rounded-[20px] p-5 sm:p-8"><div className="relative"><div className="spin-pointer" /><div className="spin-wheel" style={{ transform: `rotate(${rotation}deg)` }}><div className="spin-center">{result ? 'NICE' : 'SPIN'}</div></div></div><p className="eyebrow mt-7">One free spin today</p><h2 className="section-title mt-2 text-center">{result ? result : available ? 'Your bonus is ready' : 'Come back tomorrow'}</h2><button className="btn-accent mt-5 min-w-36" onClick={onSpin} disabled={!available || spinning} data-testid="button-spin-bonus">{spinning ? <><RefreshCw size={14} className="animate-spin" /> Spinning…</> : available ? <><Sparkles size={14} /> Spin now</> : <><LockKeyhole size={14} /> Locked</>}</button></div><div className="card-surface rounded-[20px] p-5 sm:p-7"><p className="eyebrow">Bonus rules</p><h2 className="section-title mt-2">A little extra momentum</h2><p className="muted mt-2 text-xs leading-5">Bonus outcomes are randomized demo rewards. They have no cash value and never require a deposit.</p><div className="mt-6"><Rule icon={Check} title="One spin per day" detail="Your local bonus resets when you begin a fresh session." /><Rule icon={Target} title="Eligibility: active explorer" detail="Have at least one tap or staged plan in your current session." /><Rule icon={BadgeDollarSign} title="Rewards are simulated" detail="Points and demo credit are for tracking practice only." /><Rule icon={CircleHelp} title="No purchase required" detail="Investly never asks for payment to claim a bonus." /></div></div></div><div className="card-surface rounded-[20px] p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Possible outcomes</p><h2 className="section-title mt-2">What could land?</h2></div><Gift size={20} className="text-[hsl(var(--accent-foreground))]" /></div><div className="mt-5 grid gap-3 sm:grid-cols-5">{['250 pts', '500 pts', '$0.50 credit', '1,000 pts', 'Extra power'].map((reward) => <div className="rounded-xl bg-[hsl(var(--muted))] p-3 text-center" key={reward}><p className="font-mono-app text-[10px] text-[hsl(var(--primary))]">reward</p><p className="mt-2 text-xs font-bold">{reward}</p></div>)}</div></div></div>;
}

function Rule({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return <div className="rule-item"><span className="rule-icon"><Icon size={14} /></span><div><p className="text-xs font-bold">{title}</p><p className="muted mt-1 text-xs leading-5">{detail}</p></div></div>;
}

function MiningPage({ day, progress, returnValue, onCheckIn }: { day: number; progress: number; returnValue: string; onCheckIn: () => void }) {
  return <div className="space-y-6"><div className="hero-panel"><div className="hero-copy"><p className="eyebrow !text-[#75cec1]">Proof of patience</p><h2 className="hero-heading mt-4">Let the meter<br /><span className="hero-number">do its thing.</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/55">A 15-day mining-style progress loop. Watch a fictional 5% return accrue over time — a learning visual, not a promise of profit.</p></div></div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="card-surface rounded-[20px] p-5 sm:p-7"><div className="flex items-start justify-between"><div><p className="eyebrow">Active cycle</p><h2 className="section-title mt-2">Demo mining progress</h2></div><span className="sim-chip">5% simulated</span></div><div className="mt-10 flex items-end justify-between"><div><p className="font-display text-5xl font-bold tracking-[-.08em]">{day}<span className="text-2xl text-[hsl(var(--muted-foreground))]"> / 15</span></p><p className="muted mt-2 text-xs">days logged</p></div><p className="font-mono-app text-sm text-[hsl(var(--primary))]">{Math.round(progress)}%</p></div><div className="progress-track mt-5 h-3"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex justify-between text-[11px] muted"><span>Start</span><span>Day 15 complete</span></div><button className="btn-primary mt-8 w-full sm:w-auto" onClick={onCheckIn} data-testid="button-mining-checkin">{day >= 15 ? <><Check size={15} /> Cycle complete</> : <><Play size={14} fill="currentColor" /> Log day {day + 1}</>}</button></div><div className="card-surface rounded-[20px] p-5 sm:p-7"><p className="eyebrow">At a glance</p><div className="mt-6 space-y-5"><MiningStat label="Demo principal" value="$50.00" /><MiningStat label="Simulated rate" value="5.00%" accent /><MiningStat label="Accrued so far" value={`$${returnValue}`} accent /><MiningStat label="Est. day 15 result" value="$52.50" /></div><div className="mt-7 flex gap-2 rounded-xl bg-[hsl(var(--muted))] p-3"><Info size={15} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" /><p className="muted text-[11px] leading-5">This illustration assumes a fictional fixed 5% over 15 days. Real-world assets can lose value; this dashboard makes no guarantees.</p></div></div></div><div className="card-surface rounded-[20px] p-5 sm:p-6"><div className="flex items-center gap-2"><Flame size={17} className="text-[hsl(var(--accent-foreground))]" fill="hsl(var(--accent))" /><p className="section-title">Your check-in trail</p></div><div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-15">{Array.from({ length: 15 }, (_, index) => { const done = index < day; return <div className={`flex aspect-square items-center justify-center rounded-lg text-[10px] font-bold ${done ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`} key={index} data-testid={`status-mining-day-${index + 1}`}>{done ? <Check size={12} /> : index + 1}</div>; })}</div><p className="muted mt-4 text-xs">A check-in advances the local timeline by one day. There is no background mining or network connection.</p></div></div>;
}

function MiningStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4"><span className="muted text-xs">{label}</span><span className={`font-display text-xl font-bold tracking-[-.05em] ${accent ? 'text-[hsl(var(--primary))]' : ''}`}>{value}</span></div>;
}

function EarnPage({ activePlan, claimedAds, onClaimAd, day, progress, onCheckIn }: { activePlan: string | null; claimedAds: Record<string, number>; onClaimAd: (planId: string) => void; day: number; progress: number; onCheckIn: () => void }) {
  return <div className="space-y-6"><div className="hero-panel"><div className="hero-copy"><p className="eyebrow !text-[#75cec1]">Earn inside your profile</p><h2 className="hero-heading mt-4">Watch an ad.<br /><span className="hero-number">Build your day.</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Buy a simulated plan, then complete up to five demo ads per day. Each plan has its own daily earning rate.</p></div></div><div className="card-surface flex gap-3 rounded-2xl p-4"><Info size={17} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" /><div><p className="text-xs font-bold">How daily earning works</p><p className="muted mt-1 text-xs leading-5">The $3 plan gives 5 ads × $0.20 = $1.00 per day. All values are simulated and have no cash value.</p></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{earningPlans.map((plan) => { const claimed = claimedAds[plan.planId] ?? 0; const unlocked = activePlan === plan.planId; return <div className={`card-surface rounded-[20px] p-5 ${unlocked ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`} key={plan.planId}><div className="flex items-start justify-between"><div><p className="eyebrow">${plan.amount} plan</p><h3 className="section-title mt-2">${plan.daily.toFixed(2)} <span className="text-sm font-normal muted">/ day</span></h3></div>{unlocked ? <span className="sim-chip">Active</span> : <LockKeyhole size={18} className="muted" />}</div><div className="mt-5 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-[hsl(var(--muted))] p-3"><p className="muted">Ads today</p><p className="mt-1 font-bold">{claimed} / {plan.ads}</p></div><div className="rounded-xl bg-[hsl(var(--muted))] p-3"><p className="muted">Per ad</p><p className="mt-1 font-bold">${plan.perAd.toFixed(2)}</p></div></div><button className={unlocked ? 'btn-primary mt-5 w-full' : 'btn-quiet mt-5 w-full'} onClick={() => onClaimAd(plan.planId)} data-testid={`button-earn-ad-${plan.planId}`} disabled={unlocked && claimed >= plan.ads}>{unlocked ? claimed >= plan.ads ? <><Check size={14} /> Daily limit reached</> : <><Play size={14} fill="currentColor" /> Watch demo ad · ${plan.perAd.toFixed(2)}</> : <>Buy plan to unlock <ArrowRight size={14} /></>}</button></div>; })}</div><div className="card-surface rounded-[20px] p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow">Mining cycle</p><h2 className="section-title mt-2">15-day simulated progress</h2></div><span className="sim-chip">5% demo return</span></div><div className="mt-5 flex items-end justify-between"><div><p className="font-display text-4xl font-bold tracking-[-.08em]">{day}<span className="text-xl muted"> / 15 days</span></p><p className="muted mt-1 text-xs">Current mining progress</p></div><p className="font-mono-app text-sm text-[hsl(var(--primary))]">{Math.round(progress)}%</p></div><div className="progress-track mt-4 h-3"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><button className="btn-primary mt-5" onClick={onCheckIn} data-testid="button-earn-mining-checkin">{day >= 15 ? <><Check size={14} /> Cycle complete</> : <><Play size={14} fill="currentColor" /> Log day {day + 1}</>}</button><p className="muted mt-3 text-xs leading-5">The 5% return is a fictional visual for this local simulation and is not a promise of profit.</p></div><div className="card-surface rounded-[20px] p-5 sm:p-6"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-[hsl(var(--primary))]" /><p className="text-xs font-bold">Earning simulation</p></div><p className="muted mt-2 text-xs leading-5">This area is a local gameplay illustration only. It does not display real advertisements, collect deposits, or promise income.</p></div></div>;
}

function ProfilePage({ score, dollars, swapInput, setSwapInput, onSwap, onWithdraw, activePlan, claimedAds, onClaimAd, day, progress, onCheckIn }: { score: number; dollars: number; swapInput: string; setSwapInput: (value: string) => void; onSwap: () => void; onWithdraw: () => void; activePlan: string | null; claimedAds: Record<string, number>; onClaimAd: (planId: string) => void; day: number; progress: number; onCheckIn: () => void }) {
  return <div className="space-y-6"><div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]"><div className="hero-panel"><div className="hero-copy"><div className="avatar !h-14 !w-14 !border-[#34404d] !text-base">YA</div><p className="eyebrow mt-7 !text-[#75cec1]">Explorer profile</p><h2 className="hero-heading mt-3">You are<br /><span className="hero-number">in motion.</span></h2><p className="mt-4 text-sm leading-6 text-white/55">Level 3 · 6 day streak<br />Member since this session</p></div></div><div className="card-surface rounded-[20px] p-5 sm:p-7"><div className="flex items-start justify-between"><div><p className="eyebrow">Rewards wallet</p><h2 className="section-title mt-2">Your demo balance</h2></div><WalletCards size={21} className="text-[hsl(var(--primary))]" /></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[hsl(var(--muted))] p-4"><p className="muted text-[11px]">Points</p><p className="mt-2 font-display text-3xl font-bold tracking-[-.07em]">{score.toLocaleString()}</p><p className="muted mt-1 text-[10px]">1,000 pts = $1.00</p></div><div className="rounded-xl bg-[hsl(var(--secondary))] p-4 text-[hsl(var(--secondary-foreground))]"><p className="text-[11px] text-white/55">Demo balance</p><p className="mt-2 font-display text-3xl font-bold tracking-[-.07em]">${dollars.toFixed(2)}</p><p className="mt-1 text-[10px] text-white/55">No cash value</p></div></div><div className="mt-6 flex flex-col gap-2 sm:flex-row"><input className="field" type="number" min="1000" placeholder="Points to convert" value={swapInput} onChange={(event) => setSwapInput(event.target.value)} data-testid="input-swap-points" /><button className="btn-primary shrink-0" onClick={onSwap} data-testid="button-swap-points"><RefreshCw size={14} /> Swap points</button></div><button className="btn-accent mt-3 w-full" onClick={onWithdraw} data-testid="button-open-withdraw"><ArrowDownToLine size={15} /> Withdraw to TRC20 demo wallet</button></div></div><EarnPage activePlan={activePlan} claimedAds={claimedAds} onClaimAd={onClaimAd} day={day} progress={progress} onCheckIn={onCheckIn} /><div className="grid gap-5 md:grid-cols-2"><div className="card-surface rounded-[20px] p-5 sm:p-6"><p className="eyebrow">How conversion works</p><h2 className="section-title mt-2">Keep it transparent</h2><div className="mt-5 space-y-4"><Rule icon={Coins} title="Earn points in play" detail="Taps and select bonus rewards add to your local score." /><Rule icon={RefreshCw} title="Swap at a fixed ratio" detail="Every 1,000 points becomes $1.00 of demo balance." /><Rule icon={ArrowDownToLine} title="Withdraw as a mock" detail="A wallet modal helps you practice the flow without broadcasting." /></div></div><div className="card-surface rounded-[20px] p-5 sm:p-6"><p className="eyebrow">Safety note</p><h2 className="section-title mt-2">Practice, don't predict</h2><div className="mt-5 rounded-xl border border-[rgba(208,157,51,.25)] bg-[rgba(245,186,77,.1)] p-4"><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[hsl(var(--accent-foreground))]" /><p className="text-xs font-bold">Simulation boundary</p></div><p className="muted mt-2 text-xs leading-5">Investly is a fictional rewards cockpit. It does not provide investment advice, solicit deposits, or promise any return. Always research real financial decisions independently.</p></div><div className="mt-5 flex items-center justify-between text-xs"><span className="muted">Session data</span><span className="font-mono-app text-[hsl(var(--primary))]">stored locally</span></div></div></div></div>;
}

function WithdrawModal({ amount, address, setAmount, setAddress, onClose, onSubmit }: { amount: string; address: string; setAmount: (value: string) => void; setAddress: (value: string) => void; onClose: () => void; onSubmit: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="withdraw-title"><div className="flex items-start justify-between"><div><p className="eyebrow">Demo transfer</p><h2 id="withdraw-title" className="section-title mt-2">Send to a TRC20 wallet</h2></div><button className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" onClick={onClose} aria-label="Close withdrawal modal" data-testid="button-close-withdraw"><X size={17} /></button></div><p className="muted mt-4 text-xs leading-5">This is a practice form only. Nothing leaves Investly and no blockchain transaction will be created.</p><label className="mt-6 block text-xs font-bold" htmlFor="withdraw-amount">Amount</label><div className="relative mt-2"><span className="absolute left-3 top-3 text-xs text-[hsl(var(--muted-foreground))]">$</span><input id="withdraw-amount" className="field pl-7" type="number" min="0" step=".01" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} data-testid="input-withdraw-amount" /></div><label className="mt-4 block text-xs font-bold" htmlFor="wallet-address">TRC20 address</label><input id="wallet-address" className="field mt-2" placeholder="T..." value={address} onChange={(event) => setAddress(event.target.value)} data-testid="input-wallet-address" /><div className="mt-6 flex justify-end gap-2"><button className="btn-quiet" onClick={onClose} data-testid="button-cancel-withdraw">Cancel</button><button className="btn-primary" onClick={onSubmit} data-testid="button-submit-withdraw"><ArrowDownToLine size={14} /> Queue demo withdrawal</button></div></div></div>;
}

function EmptyState({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return <div className="flex min-h-32 flex-col items-center justify-center text-center"><Icon size={20} className="text-[hsl(var(--muted-foreground))]" /><p className="mt-3 text-xs font-bold">{title}</p><p className="muted mt-1 text-xs">{detail}</p></div>;
}

function currency(value: number) {
  return `$${value.toFixed(2)}`;
}

function pageHeading(view: View) {
  return { home: 'Good morning, explorer', plans: 'Pick your experiment', bonus: 'Your daily surprise', mining: 'Watch the progress', profile: 'Your rewards, your pace' }[view];
}

export default App;