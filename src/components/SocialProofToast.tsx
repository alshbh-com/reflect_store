import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

const NAMES = [
  "أحمد", "محمد", "علي", "محمود", "كريم", "يوسف", "خالد", "عمر", "حسن", "إبراهيم",
  "سارة", "منى", "نور", "هدى", "مريم", "أميرة", "دينا", "ياسمين", "ريم", "فاطمة",
  "مصطفى", "طارق", "وليد", "هشام", "رنا", "سلمى", "ملك", "حبيبة", "جنى", "ليلى",
];

const GOVS = [
  "القاهرة", "الجيزة", "الإسكندرية", "المنصورة", "طنطا", "أسيوط", "سوهاج", "الفيوم",
  "بورسعيد", "الإسماعيلية", "السويس", "دمياط", "الزقازيق", "بني سويف", "المنيا",
  "قنا", "أسوان", "الأقصر", "العريش", "شرم الشيخ", "الغردقة", "كفر الشيخ", "البحيرة",
];

const PRODUCTS = [
  "فستان سواريه", "بلوزة كاجوال", "جاكيت شتوي", "حذاء رياضي", "شنطة يد", "ساعة فاخرة",
  "عطر فرنسي", "كريم مرطب", "روج مات", "ماسكارا", "نظارة شمس", "إكسسوار ذهبي",
  "تيشيرت قطن", "بنطلون جينز", "عباية مطرزة", "حجاب حرير", "صندل صيفي",
];

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomMinsAgo() {
  const n = Math.floor(Math.random() * 28) + 2;
  return `منذ ${n} دقيقة`;
}

export function SocialProofToast() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    const schedule = () => {
      const delay = (Math.floor(Math.random() * 21) + 20) * 1000; // 20-40s
      timerRef.current = setTimeout(() => {
        if (!mounted) return;
        const name = rand(NAMES);
        const gov = rand(GOVS);
        const product = rand(PRODUCTS);
        toast(
          <div className="flex items-start gap-2.5 text-right" dir="rtl">
            <div className="size-9 rounded-full bg-primary/15 grid place-items-center shrink-0">
              <ShoppingBag className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">
                {name} من {gov}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                اشترى للتو: {product}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{randomMinsAgo()}</p>
            </div>
          </div>,
          { duration: 5000, position: "bottom-right" },
        );
        schedule();
      }, delay);
    };

    // first one fires after 8-15s so users see it quickly
    timerRef.current = setTimeout(schedule, (Math.floor(Math.random() * 8) + 8) * 1000);

    return () => {
      mounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
