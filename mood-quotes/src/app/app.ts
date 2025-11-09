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
    welcome: 'Welcome',
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
    en: ['Joy is a habit.', 'Choose sunshine today.', 'Gratitude turns enough into plenty.'],
    ur: ['خوشی ایک عادت ہے۔', 'آج روشنی کا انتخاب کریں۔', 'شکر گزاری کمی کو کافی بنا دیتی ہے۔'],
  },
  sad: {
    en: ['Even rain helps flowers grow.', 'Feel it, then let go.', 'The night teaches the value of dawn.'],
    ur: ['بارش بھی پھولوں کو اگاتی ہے۔', 'محسوس کریں، پھر چھوڑ دیں۔', 'رات سحر کی قدر سکھاتی ہے۔'],
  },
  focused: {
    en: ['Small steps, big results.', 'Deep work beats busy work.', 'One clear goal at a time.'],
    ur: ['چھوٹے قدم، بڑے نتائج۔', 'گہرا کام مصروفیت سے بہتر۔', 'ایک وقت میں ایک واضح ہدف۔'],
  },
  creative: {
    en: ['Curiosity sparks creation.', 'Make first, refine later.', 'Play is the engine of ideas.'],
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

  showWelcome = signal<boolean>(true);

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
    // Intro animation
    try {
      const { gsap } = await import('gsap');
      gsap.set(this.appRoot.nativeElement, { opacity: 0, y: 12 });
      gsap.to(this.appRoot.nativeElement, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.35 });

      if (this.welcomeEl) {
        const tl = gsap.timeline();
        tl.fromTo(this.welcomeEl.nativeElement, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' })
          .to(this.welcomeEl.nativeElement, { y: -8, opacity: 0, duration: 0.5, delay: 0.6, ease: 'power1.in' })
          .add(() => this.showWelcome.set(false));
      }

      this.animateQuote();
      gsap.from('.mood', { opacity: 0, y: 8, stagger: 0.08, duration: 0.35, ease: 'power1.out', delay: 0.3 });
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
        gsap.fromTo(el, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power1.out' });
        gsap.to(el, { y: 2, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }
    } catch { /* CSS fallback already present */ }
  }
}
