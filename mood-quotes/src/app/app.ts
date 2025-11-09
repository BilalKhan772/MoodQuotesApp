import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

type Lang = 'en' | 'ur';
type Mood = 'happy' | 'sad' | 'focused' | 'creative';

const LABELS = {
  en: {
    appName: 'Mood Quotes',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    moods: { happy: 'Happy', sad: 'Sad', focused: 'Focused', creative: 'Creative' },
    newQuote: 'New Quote',
    welcome: 'Hello & Welcome',
  },
  ur: {
    appName: 'مزاجی اقوال',
    language: 'زبان',
    theme: 'وضع',
    light: 'روشن',
    dark: 'تاریک',
    moods: { happy: 'خوش', sad: 'اداس', focused: 'توجہ', creative: 'تخلیقی' },
    newQuote: 'نیا قول',
    welcome: 'خوش آمدید',
  },
} as const;

type Quotes = Record<Mood, Record<Lang, string[]>>;
const QUOTES: Quotes = {
  happy: {
    en: ['Smile — it’s the key that fits everyone’s heart.', 'Keep shining, the world needs your light.','Be happy with what you have while working for what you want.','Gratitude turns enough into plenty.','Let your smile change the world.','Good vibes start with a grateful heart.','Start each day with a smile and a thankful heart.','When you focus on the good, the good gets better.','Keep your heart light and your thoughts brighter.'],
    ur: ['خوشی ایک عادت ہے۔', 'آج روشنی کا انتخاب کریں۔', 'شکر گزاری کمی کو کافی بنا دیتی ہے۔'],
  },
  sad: {
    en: ['I wish I could forget the things I remember too well.', 'Some memories never fade, they just live quietly inside you.', 'Pain changes people sometimes into someone they no longer recognize.','Time heals nothing if you keep remembering everything.','Silence is sometimes the loudest cry.','Some scars never fade; they just stop bleeding.','It’s hard to find light when you’ve lived too long in the dark.','I don’t fear loneliness — I fear never feeling understood.','Some storms never end; they just become part of who you are.'],
    ur: ['بارش بھی پھولوں کو اگاتی ہے۔', 'محسوس کریں، پھر چھوڑ دیں۔', 'رات سحر کی قدر سکھاتی ہے۔'],
  },
  focused: {
    en: ['Don’t watch the clock — do what it does, keep going.', 'Focus on progress, not perfection.', 'Don’t be busy, be productive.','Your mind is a garden — grow what matters.','When your vision is clear, decisions become easy.','Clarity of mind leads to power of action.','Focus isn’t about doing more, it’s about doing what counts.','The mind that’s calm is the mind that wins.','Don’t scatter your energy — aim it.'],
    ur: ['چھوٹے قدم، بڑے نتائج۔', 'گہرا کام مصروفیت سے بہتر۔', 'ایک وقت میں ایک واضح ہدف۔'],
  },
  creative: {
    en: ['The world is your canvas; paint it with your ideas.', 'Mistakes are proof that you’re trying something new.', 'Every idea starts as a spark — protect it until it becomes a flame.','Art is not what you see, but what you make others see.','Create what you wish existed.','Your imagination is your greatest superpower.','The more you explore, the more your mind invents.','A creative mind sees opportunity in chaos.','Turn your thoughts into art and your dreams into design.'],
    ur: ['جستجو تخلیق جگاتی ہے۔', 'پہلے بنائیں، پھر سنواریں۔', 'کھیل خیالوں کا انجن ہے۔'],
  },
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit {
  currentYear = new Date().getFullYear();

  lang  = signal<Lang>((localStorage.getItem('lang') as Lang) || 'en');
  theme = signal<'light'|'dark'>((localStorage.getItem('theme') as 'light'|'dark') || 'light');
  mood  = signal<Mood>((localStorage.getItem('mood') as Mood) || 'happy');
  index = signal<number>(0);

  showWelcome = signal(true);

  labels = computed(() => LABELS[this.lang()]);
  isRtl  = computed(() => this.lang() === 'ur');

  currentQuote = computed(() => {
    const list = QUOTES[this.mood()][this.lang()];
    return list[this.index() % list.length];
  });
  words = computed(() => this.currentQuote().split(' '));

  @ViewChild('quoteEl') quoteEl!: ElementRef<HTMLDivElement>;
  @ViewChild('appRoot') appRoot!: ElementRef<HTMLDivElement>;
  @ViewChild('welcomeEl') welcomeEl!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.applyTheme();
    this.applyDir();
  }

  async ngAfterViewInit() {
    try {
      const { gsap } = await import('gsap');
      gsap.set(this.appRoot.nativeElement, { opacity: 0 });

      const card  = this.welcomeEl.nativeElement.querySelector('.welcome-card') as HTMLElement;
      const title = this.welcomeEl.nativeElement.querySelector('.welcome-title') as HTMLElement;
      const sub   = this.welcomeEl.nativeElement.querySelector('.welcome-sub') as HTMLElement;

      const tl = gsap.timeline();
      tl.fromTo(card, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' })
        .fromTo(title, { letterSpacing: '-2px', y: 8, opacity: 0 }, { letterSpacing: '1px', y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.1')
        .fromTo(sub, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out' }, '-=0.2')
        .to(this.welcomeEl.nativeElement, { opacity: 0, duration: 0.7, delay: 0.9, ease: 'power1.inOut', onComplete: () => this.showWelcome.set(false) })
        .to(this.appRoot.nativeElement, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '<0.05');

      this.animateQuote();
      // entry for mood chips
      gsap.from('.mood', { opacity: 0, y: 8, stagger: 0.08, duration: 0.35, ease: 'power1.out', delay: 0.4 });
    } catch {
      this.showWelcome.set(false);
    }
  }

  setLang(l: Lang) {
    this.lang.set(l);
    localStorage.setItem('lang', l);
    this.applyDir();
    this.animateQuote();
  }

  toggleTheme(checked: boolean) {
    const t = checked ? 'dark' : 'light';
    this.theme.set(t);
    localStorage.setItem('theme', t);
    this.applyTheme();
  }
  setTheme(t:'light'|'dark') { this.toggleTheme(t === 'dark'); }

  setMood(m: Mood) {
    if (this.mood() !== m) this.index.set(0);
    this.mood.set(m);
    localStorage.setItem('mood', m);
    this.animateQuote();
  }

  nextQuote() {
    this.index.update(v => v + 1);
    this.animateQuote();
  }

  private applyTheme() {
    // welcome overlay selectors depend on <html>.dark
    document.documentElement.classList.toggle('dark', this.theme() === 'dark');
  }

  private applyDir() {
    document.documentElement.setAttribute('dir', this.isRtl() ? 'rtl' : 'ltr');
    document.documentElement.lang = this.lang();
  }

  private async animateQuote() {
    try {
      const { gsap } = await import('gsap');
      if (this.quoteEl?.nativeElement) {
        const el = this.quoteEl.nativeElement;
        gsap.killTweensOf(el);
        gsap.fromTo(el, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' });
        gsap.to(el, { y: 2, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }
    } catch {}
  }
}
