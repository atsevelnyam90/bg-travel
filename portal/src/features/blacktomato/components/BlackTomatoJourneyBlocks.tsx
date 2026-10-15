"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type JourneyCategoryId,
  useJourneyExplorerScreen,
} from "../hooks/useJourneyExplorerScreen";
import { BlackTomatoBookingBudgetSection } from "./BlackTomatoBookingBudgetSection";
import styles from "./journey.module.css";

type JourneyTrip = {
  duration: string;
  galleryImage?: string;
  highlights?: string[];
  image: string;
  intro?: string;
  itinerary?: { day: string; description: string; title: string }[];
  mediaCaption?: string;
  season?: string;
  videoId?: string;
  price: string;
  region: string;
  title: string;
};

type JourneyCategory = {
  id: JourneyCategoryId;
  image: string;
  subtitle: string;
  title: string;
  trips: JourneyTrip[];
};

const journeyCategories: JourneyCategory[] = [
  {
    id: "domestic",
    title: "Дотоод аялал",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2025/02/3OxkpiGQ-FeeKbyBI-freepik__upload__60443-resized.jpg",
    subtitle: "Монгол орны онцгой маршрутууд",
    trips: [
      {
        duration: "5 өдөр",
        image: "/images/trips/gobi-sunset.png",
        galleryImage: "/images/trips/gobi-dunes.png",
        videoId: "2b7s7Xy1MsU",
        mediaCaption: "Алтан элсэн манхан · Говь",
        intro: "Элсэн манхан, хадат хавцал, үлэг гүрвэлийн мөрөөр Өмнөговийн уудам орон зайг удаанаар туулах аялал.",
        highlights: ["Ёлын амны хавцал", "Хонгорын элс", "Баянзагийн улаан цав"],
        season: "5–9 сар",
        itinerary: [
          { day: "01", title: "Говийн зүг", description: "Өглөө Улаанбаатараас хөдөлж, уудам талын замаар Даланзадгад чиглэнэ. Замдаа хээр талын жижиг суурин, байгалийн үзэмжит цэгүүдэд саатан амарч, нутгийн цай, өдрийн хоол зооглоно. Орой аяллын багтайгаа танилцаж, маргаашийн алхалтын бэлтгэлээ базаана." },
          { day: "02", title: "Ёлын ам", description: "Өглөөний цайны дараа Говь гурван сайханы уулсыг зорьж, хавцлын сэрүүн жимээр хөтөчтэй алхана. Хад асга, нарийн хавцал, улирлаас шалтгаалан мөстэй байж болох хэсгүүдийг ажиглаж, зураг авах завсарлага авна. Өдрийн хоолоо бэлдсэн байдлаар идээд, орой буудалдаа амарна." },
          { day: "03", title: "Хонгорын элс", description: "Өнөөдөр Хонгорын элсэн манханд хүрч, салхины аясаар өөрчлөгдөх элсний хээ болон говийн уудам төрхийг мэдэрнэ. Хүсвэл нутгийн тэмээчинтэй уулзаж, нэмэлтээр тэмээн аялалд оролцож болно. Нар жаргах үеэр манхнаас алсын уулсыг харан амарч, орой нутгийн хоолтой тайван үдшийг өнгөрөөнө." },
          { day: "04", title: "Баянзаг", description: "Өглөө Баянзагийн улаан цавын дундуур алхаж, салхи, нарны нөлөөгөөр хэлбэржсэн хадны өнгө хэрхэн солигдохыг харна. Хөтөчөөс энэ нутгийн геологи, үлэг гүрвэлийн олдворын тухай сонирхолтой түүх сонсоно. Өдрийн турш зураг авах, амрах цагтай бөгөөд орой аяллын тэмдэглэлээ хуваалцана." },
          { day: "05", title: "Хот руу буцах", description: "Өглөөний цайгаа уусны дараа говийн сүүлчийн үзэмжит цэгт саатаж, буцах замдаа гарна. Замын дундах амралтын зогсоолуудад хөлөө амрааж, өдрийн хоолоо иднэ. Орой Улаанбаатарт хүрч аяллаа өндөрлөх бөгөөд хотод ирэх цаг замын нөхцөлөөс хамаарч өөрчлөгдөж болно." },
        ],
        price: "MNT 1,450,000 · MOCK",
        region: "Өмнөговь",
        title: "Говийн аялал",
      },
      {
        duration: "6 өдөр",
        image: "/images/trips/khangai-lake.png",
        galleryImage: "/images/trips/khangai-river.png",
        videoId: "cHVbWaPBTEI",
        mediaCaption: "Тэрхийн цагаан нуур · Хангай",
        intro: "Уулын цэнгэг агаар, нуурын нам гүм эрэг, нутгийн амьдралтай ойр танилцах Хангайн аялал.",
        highlights: ["Тэрхийн цагаан нуур", "Хоргын тогоо", "Хангайн ногоон хөндий"],
        season: "6–9 сар",
        itinerary: [
          { day: "01", title: "Хангайн зүг", description: "Улаанбаатараас Архангай аймгийн чиглэлд хөдөлж, замын турш тал хээрээс уулын бүс рүү шилжих байгалийн өнгө төрхийг ажиглана. Үзэмжит цэгүүдэд богино завсарлага авч, өдрийн хоолоо замдаа иднэ. Орой хангайн хөндийд байрлан амарч, дараагийн өдрийн маршрутаа хөтөчтэй ярилцана." },
          { day: "02", title: "Хоргын тогоо", description: "Өглөө Хоргын тогоог зорьж, галт уулын тогооны амсар болон эргэн тойрны хүрмэн чулуун тогтоцыг хөтөчтэй үзнэ. Алхалтын хурдыг багийн ая тухад тааруулж, зураг авах болон амрах завсарлага авна. Буцах замдаа нутгийн байгалийн тогтоцын тухай сонсож, орой тайван амарна." },
          { day: "03", title: "Тэрхийн цагаан нуур", description: "Нуурын эргээр тайван алхаж, ус, уул, ой хосолсон Хангайн үзэмжийг өөр өөр цэгээс сонирхоно. Цаг агаар тохирвол эрэг дээр цай ууж амрах бөгөөд хүссэн хүн зураг авах чөлөөт цагтай. Өдрийн хоолны дараа нуурын орчмын байгалийн жимээр богино аялал хийнэ." },
          { day: "04", title: "Нутгийн амьдрал", description: "Ойр орчмын малчин айлд зочилж, улирлын ажил, мал маллах арга, нүүдлийн ахуйн талаар ярилцана. Зочлох айл болон үйл ажиллагаа нь тухайн өдрийн боломж, айлын зөвшөөрлөөс хамаарах жишиг төлөвлөгөө юм. Нутгийн цай, хоол амсаж, үдээс хойш амралтаа үргэлжлүүлнэ." },
          { day: "05", title: "Хангайн замаар", description: "Голын хөндий, уулын бэл даган Өвөрхангайн зүг хөдөлж, замын дагуух байгалийн тогтоцод саатна. Замдаа өдрийн хоол идэж, хөлөө амраах завсарлага авна. Орой буудалдаа хүрсний дараа тухайн бүсийн онцлог, маргаашийн буцах замын талаар хөтөч мэдээлэл өгнө." },
          { day: "06", title: "Буцах зам", description: "Өглөөний цайны дараа Хангайн сүүлчийн үзэмжит зогсоолоор орж, Улаанбаатарын чиглэлд буцна. Замдаа амралтын цэгүүдэд зогсож, өдрийн хоол идэн аяллын турш авсан зураг, дурсамжаа хуваалцана. Хотод ирэх цаг замын нөхцөлөөс шалтгаалан өөрчлөгдөж болно." },
        ],
        price: "MNT 1,650,000 · MOCK",
        region: "Архангай · Өвөрхангай",
        title: "Хангайн аялал",
      },
      {
        duration: "7 өдөр",
        image: "/images/trips/tavan-bogd-glacier.png",
        galleryImage: "/images/trips/tavan-bogd-eagle.png",
        videoId: "AlUVC6Om7S8",
        mediaCaption: "Алтайн мөсөн гол · Таван богд",
        intro: "Монгол Алтайн өндөр уулс, мөсөн гол, казах түмний зочломтгой ахуйг нэг аяллаар мэдрэх адал явдал.",
        highlights: ["Алтай Таван Богдын уулс", "Потанины мөсөн гол", "Баян-Өлгийн казах соёл"],
        season: "7–9 сар",
        itinerary: [
          { day: "01", title: "Өлгий хот", description: "Баян-Өлгийд хүрэлцэн ирж, нисэх буудал эсвэл тохирсон уулзах цэгээс хөтөчтэйгээ уулзана. Аяллын чиглэл, цаг агаар, өндөрлөг газрын бэлтгэлийг ярилцаж, хэрэглэх хувцас хэрэгслийг шалгана. Хотод амарч, нутгийн хоолтой танилцах оройн зоог барина." },
          { day: "02", title: "Алтайн хөндий", description: "Өглөөний цайны дараа Алтайн уулсын бэл рүү машинаар хөдөлж, гол горхи, өндөр уулын бэлчээр бүхий замаар аялна. Замдаа зураг авах, хөнгөн өдрийн хоол идэх зогсоол хийнэ. Боломж таарвал бүргэдчин айлд зочилж, бүргэдээр ан хийх уламжлалын тухай сонсоно." },
          { day: "03", title: "Өндөрлөгийн зам", description: "Таван Богдын байгалийн цогцолборт газрын чиглэлд бартаат замаар явж, өндөрлөг газрын уудам хөндий, уулсын барааг ажиглана. Хөтөч замын нөхцөлд тохируулан зогсоол, алхалтын зайг сонгоно. Орой байрлах цэгтээ хүрч, халуун хоол идэн маргаашийн алхалтад амарна." },
          { day: "04", title: "Мөсөн голын үзэмж", description: "Өглөө эрт хөнгөн цай уугаад Потанины мөсөн голыг харах чиглэлд хөтөчтэй алхана. Өндөрлөг газрын салхи, замын гадаргад тохируулан тогтмол амарч, ус уух болон зураг авах завсарлага авна. Хүрэх цэгийг оролцогчдын биеийн байдал, цаг агаар, замын аюулгүй байдлаар шийднэ." },
          { day: "05", title: "Уулын өдөр", description: "Өнөөдөр уулын бэл болон ойр орчмын хөндийгөөр алхаж, Алтайн байгалийг илүү тайван хэмнэлээр мэдэрнэ. Өглөөний агаарт зураг авах, шувуу болон уулын ургамал ажиглах цаг гаргана. Үдээс хойш амарч, халуун цай уун аяллын тэмдэглэлээ хөтлөх боломжтой." },
          { day: "06", title: "Өлгий рүү буцах", description: "Уулын бүсээс бууж Баян-Өлгий рүү хөдөлнө. Замдаа үзэмжит цэгт зогсож, аяллын багийн зураг авах болон өдрийн хоол идэх завсарлага авна. Хотод хүрсний дараа нутгийн хоол амталж, боломжтой бол зах эсвэл соёлын төвөөр богино танилцах аялал хийнэ." },
          { day: "07", title: "Аяллын төгсгөл", description: "Өглөөний цайны дараа нисэх буудал эсвэл буцах тээврийн цэг рүү хүргүүлнэ. Хөтөч аяллын багийн хэрэгслийг шалгаж, сүүлийн асуултад хариулна. Буцах нислэгийн цаг, тээврийн тасалбарын нөхцөлөөс шалтгаалан энэ өдрийн хуваарь өөрчлөгдөж болно." },
        ],
        price: "MNT 2,500,000 · MOCK",
        region: "Баян-Өлгий · Алтай Таван Богд",
        title: "Таван богд аялал",
      },
      {
        duration: "3 өдөр",
        image: "/images/trips/terelj-valley.png",
        galleryImage: "/images/trips/terelj-turtle-rock.png",
        videoId: "v6p5rjNboXs",
        mediaCaption: "Мэлхий хад · Тэрэлж",
        intro: "Хотын хэмнэлээс түр холдож, ой мод, хад асга, голын хөндийгөөр тайван амрах богино аялал.",
        highlights: ["Мэлхий хад", "Ариабалын хийд", "Тэрэлжийн голын хөндий"],
        season: "5–10 сар",
        itinerary: [
          { day: "01", title: "Тэрэлжид ирэх", description: "Улаанбаатараас өглөө хөдөлж, замдаа Тэрэлжийн байгалийн цогцолборт газрын Мэлхий хаданд саатна. Хадны орчмоор алхаж зураг авах, цай ууж амрах хугацаатай. Үдээс хойш байрлах газартаа хүрч, голын хөндийн агаарт тайван амарна." },
          { day: "02", title: "Хөндий ба хийд", description: "Өглөөний цайны дараа Ариабалын хийд рүү чиглэсэн жимээр алхаж, замын турш хадат уулс, ой мод, хөндийн үзэмжийг сонирхоно. Алхалтыг өөрийн хурдаар хийх боломжтой бөгөөд хөтөч амрах цэгүүдийг зааж өгнө. Үдээс хойш байрлах газартаа чөлөөт цагтай." },
          { day: "03", title: "Өглөөний морин аялал", description: "Өглөө хүсвэл туршлагатай унаачийн зааварчилгаатай морин аялалд нэмэлтээр оролцож, хөндийн замаар аялах боломжтой. Морь унахгүй аялагчид өглөөг амарч, орчныг бие даан сонирхож болно. Өдрийн хоолны дараа Улаанбаатар руу буцаж, замдаа нэг удаа амарна." },
        ],
        price: "MNT 890,000 · MOCK",
        region: "Тэрэлж",
        title: "Тэрэлжийн аялал",
      },
      {
        duration: "8 өдөр",
        image: "/images/trips/gobi-khangai.png",
        galleryImage: "/images/trips/khangai-river.png",
        videoId: "cHVbWaPBTEI",
        mediaCaption: "Говийн уудам · Хангайн ногоон хөндий",
        intro: "Говийн улаан хад, алтан элснээс Хангайн ногоон хөндий хүртэл байгалийн хоёр өөр ертөнцөөр аялах урт маршрут.",
        highlights: ["Ёлын ам ба Баянзаг", "Хонгорын элс", "Хангайн нурууны хөндий"],
        season: "6–9 сар",
        itinerary: [
          { day: "01", title: "Өмнөговь руу", description: "Улаанбаатараас говийн зүг хөдөлж, замдаа амралтын цэгүүдэд саатан алсын замаа хэсэгчлэн туулна. Өдрийн хоолоо замд идэж, тал нутгийн өнгө төрх өөрчлөгдөхийг ажиглана. Орой байрлах газартаа хүрч, говийн маршрутын талаар хөтөчтэй танилцана." },
          { day: "02", title: "Ёлын ам", description: "Өглөөний цайны дараа Ёлын амны хавцлын жимээр хөтөчтэй алхаж, хадат уулс, нарийн хавцал, байгалийн сэрүүн хэсгүүдийг үзнэ. Алхалтын үеэр зураг авах, амрах завсарлага гаргана. Үдээс хойш байрлах газартаа буцаж, оройн хоолны өмнө чөлөөт цагтай." },
          { day: "03", title: "Хонгорын элс", description: "Хонгорын элсэн манханд хүрч, салхиар зурсан элсний хээ, уудам хөндийн үзэмжийг сонирхоно. Хүсвэл нэмэлт төлбөртэй тэмээн аялал сонгох боломжтой. Оройн нарны зөөлөн гэрэлд зураг авч, өдөржин явсны дараа байрлах газартаа амарна." },
          { day: "04", title: "Баянзаг", description: "Баянзагийн улаан цавын дундуур алхаж, хадны давхарга, өнгө, хэлбэрийн ялгааг ойроос ажиглана. Хөтөч үлэг гүрвэлийн олдвор болон нутгийн геологийн тухай тайлбарлаж, зураг авах цэгүүдийг зааж өгнө. Өдрийн хоолны дараа тайван амрах цагтай." },
          { day: "05", title: "Хангай руу шилжих", description: "Говийн бүсээс хойд зүг хөдөлж, алтан шаргал газар нутаг аажмаар уул, голын хөндийгөөр солигдохыг замын турш ажиглана. Урт замд төлөвлөсөн амралт, хоолны зогсоолууд хийнэ. Орой Хангайн бүсэд хүрч, маргаашийн хөтөлбөрт бэлтгэнэ." },
          { day: "06", title: "Хангайн хөндий", description: "Ногоон бэлчээр, голын эргийн жимээр алхаж, Хангайн байгалийн өөр хэмнэлийг мэдэрнэ. Нутгийн айлтай уулзах боломж таарвал малчны ахуй, улирлын ажлын тухай ярилцана. Өдрийн хоолны дараа голын эрэгт амарч, зураг авах чөлөөт цаг гаргана." },
          { day: "07", title: "Уулын амралт", description: "Өнөөдрийн хуваарийг илүү тайван байлгаж, ойр орчмын уулын бэлээр хөнгөн алхалт хийнэ. Хүссэн аялагчид байгалийн зураг авах, голын хөндийд амрах эсвэл нутгийн амьдралтай танилцах сонголттой. Орой багийн сүүлчийн хамтын зоог барьж аяллын дурсамжаа хуваалцана." },
          { day: "08", title: "Улаанбаатар руу", description: "Өглөөний цайгаа уугаад Улаанбаатарын чиглэлд буцна. Замын дагуу амралтын цэгүүдэд зогсож, өдрийн хоолоо идэн алсын замаа тухтай туулна. Хотод ирэх цаг зам, цаг агаарын нөхцөлөөс хамаарч өөрчлөгдөж болох тул буцах өдрийн бусад төлөвлөгөөг уян хатан байлгаарай." },
        ],
        price: "MNT 2,200,000 · MOCK",
        region: "Өмнөговь · Архангай",
        title: "Говь хангай хосолсон аялал",
      },
    ],
  },
  {
    id: "international",
    title: "Гадаад аялал",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/02/Borana-Lodge-Location-Setting-Pride-Rock.jpg",
    subtitle: "Дэлхийн шилдэг чиглэлүүд",
    trips: [
      {
        duration: "10 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2019/09/Ninja-martial-arts-in-Tokyo.jpg",
        price: "MNT 10,400,000",
        region: "Japan",
        title: "Japan Ryokan & Culture",
      },
      {
        duration: "8 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/02/Borana-Lodge-Location-Setting-Pride-Rock.jpg",
        price: "MNT 11,800,000",
        region: "Kenya",
        title: "Kenya Private Safari",
      },
      {
        duration: "7 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2024/02/Atlas-mountains-morocco-landscape.jpg",
        price: "MNT 7,000,000",
        region: "Morocco",
        title: "Morocco Atlas Journey",
      },
    ],
  },
  {
    id: "wedding",
    title: "Хурим",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2026/01/Couple-Italy-couple-swimming.jpg",
    subtitle: "Хурим болон бал сарын аялал",
    trips: [
      {
        duration: "9 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2022/09/Highlights-of-Italy-scaled.jpg",
        price: "MNT 8,000,000",
        region: "Italy",
        title: "Italy Wedding Journey",
      },
      {
        duration: "11 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/01/Family-island-hopping-scaled.jpg",
        price: "MNT 9,800,000",
        region: "Greece",
        title: "Greek Island Honeymoon",
      },
      {
        duration: "8 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2026/02/Lady-in-Forest-1-1.jpg",
        price: "MNT 12,800,000",
        region: "Brazil",
        title: "Rainforest Couple Retreat",
      },
    ],
  },
];

export function BlackTomatoJourneyBlocks() {
  const screen = useJourneyExplorerScreen();
  const selectedCategory =
    journeyCategories.find((category) => category.id === screen.selectedCategoryId) ?? null;
  const selectedTrip =
    selectedCategory?.trips.find(
      (trip) => trip.title === (screen.selectedTripTitle ?? screen.closingTripTitle),
    ) ?? null;

  return (
    <div className={styles.blocks}>
      <div className={styles.bookingColumn} id="journey-booking">
        <BlackTomatoBookingBudgetSection variant="card" />
      </div>

      <div
        className={`${styles.explorer} ${screen.isCategoryOpen ? styles.explorerOpen : ""} ${screen.selectedTripTitle ? styles.explorerDetail : ""}`}
        data-selected-category={selectedCategory?.id}
      >
        <div className={styles.categoryCards} aria-hidden={screen.isCategoryOpen}>
          {journeyCategories.map((category) => (
            <div
              className={`col col--3 panel content__over post-layout-- ${styles.categoryCard} ${
                category.id === screen.selectedCategoryId ? styles.categoryCardSelected : ""
              }`}
              key={category.id}
              style={{ width: "100%" }}
            >
              <div
                className="panel__content panel__content--overlay panel__content--with-link"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <button
                  aria-expanded={screen.isCategoryOpen && category.id === screen.selectedCategoryId}
                  className={styles.categoryButton}
                  onClick={() => screen.openCategory(category.id, category.trips.length)}
                  tabIndex={screen.isCategoryOpen ? -1 : 0}
                  type="button"
                >
                  <h5 className="h6 strong">{category.title}</h5>
                  <div className="overlay" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div aria-hidden={!screen.isCategoryOpen} aria-live="polite" className={styles.tripPanel}>
          {selectedCategory ? (
            <>
              <header className={styles.tripPanelHeader} id="trip-list">
                <button
                  aria-label={screen.selectedTripTitle || screen.closingTripTitle ? "Аяллын жагсаалт руу буцах" : "Ангиллууд руу буцах"}
                  className={styles.backButton}
                  onClick={screen.selectedTripTitle || screen.closingTripTitle ? screen.closeTrip : screen.closeCategory}
                  tabIndex={screen.isCategoryOpen ? 0 : -1}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={20} />
                </button>
                <div>
                  <p className={styles.panelEyebrow}>Explore our trips</p>
                  <h3 className={styles.panelTitle}>{selectedCategory.title}</h3>
                  <p className={styles.panelSubtitle}>{selectedCategory.subtitle}</p>
                </div>
              </header>

              <div aria-hidden={screen.selectedTripTitle !== null} className={styles.tripCarousel} inert={screen.selectedTripTitle !== null}>
                <div
                  className={styles.tripViewport}
                  onScroll={screen.syncTripNavigation}
                  ref={screen.tripViewportRef}
                >
                  <div className={styles.tripGrid}>
                    {selectedCategory.trips.map((trip) => (
                      <button
                        aria-expanded={screen.selectedTripTitle === trip.title}
                        className={`card card--standard ${styles.tripCard}`}
                        data-v-5181d785=""
                        key={trip.title}
                        onClick={() => screen.openTrip(trip.title)}
                        type="button"
                      >
                        <div className="card__inner" data-v-5181d785="">
                          {/* biome-ignore lint/performance/noImgElement: the legacy card styles target a native image */}
                          <img
                            alt=""
                            className="card__image card__image--not-clickable"
                            data-v-5181d785=""
                            loading="eager"
                            src={trip.image}
                          />
                          <div className="card__content" data-v-5181d785="">
                            <div className="card__nights" data-v-5181d785="">
                              <div
                                className="text-sm-xs uppercase text-shadow strong"
                                data-v-5181d785=""
                              >
                                {trip.duration}
                              </div>
                            </div>
                            <div className="card__overlay" data-v-5181d785="">
                              <div
                                className="card__region uppercase text-xxs letter-spaced-smmd strong mb-xxs"
                                data-v-5181d785=""
                              >
                                {trip.region}
                              </div>
                              <h6
                                className={`card__title text-base-bg letter-spaced-l ${styles.tripTitle}`}
                                data-v-5181d785=""
                              >
                                {trip.title}
                              </h6>
                              <div className="card__excerpt mb-sm text-base-bg" data-v-5181d785="">
                                <div className="text-xs-lg italic mt-xs" data-v-5181d785="">
                                  {trip.price}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedCategory.trips.length > (screen.isMobile ? 1 : 3) ? (
                  <div className={styles.tripNavigation}>
                    <button
                      aria-label="Өмнөх аяллууд"
                      className={styles.tripNavigationButton}
                      disabled={!screen.canScrollTripsBack}
                      onClick={() => screen.scrollTrips(-1)}
                      type="button"
                    >
                      <ChevronLeft aria-hidden="true" size={20} />
                    </button>
                    <button
                      aria-label="Дараагийн аяллууд"
                      className={styles.tripNavigationButton}
                      disabled={!screen.canScrollTripsForward}
                      onClick={() => screen.scrollTrips(1)}
                      type="button"
                    >
                      <ChevronRight aria-hidden="true" size={20} />
                    </button>
                  </div>
                ) : null}
              </div>

              {selectedTrip ? (
                <section aria-labelledby="trip-overview-title" className={`${styles.tripDetail} ${screen.isTripClosing ? styles.tripDetailClosing : ""}`} id="trip-detail" tabIndex={-1}>
                  <nav aria-label="Аяллын мэдээллийн хэсгүүд" className={styles.btDetailNav}>
                    <a href="#trip-overview">Тойм</a><a href="#trip-route">Хөтөлбөр</a><a href="#trip-media">Зураг, бичлэг</a>
                    <button onClick={() => document.getElementById("journey-booking")?.scrollIntoView({ behavior: "instant", block: "start" })} type="button">Захиалах <ChevronRight aria-hidden="true" size={15} /></button>
                  </nav>
                  <section aria-labelledby="trip-overview-title" className={styles.btOverview} id="trip-overview">
                    <p className={styles.btEyebrow}>{selectedTrip.region}</p><h3 id="trip-overview-title">{selectedTrip.title}</h3>
                    <p>{selectedTrip.intro ?? `${selectedTrip.region} чиглэлийн байгаль, нутгийн соёлтой танилцах онцгой аялал.`}</p>
                  </section>
                  <section aria-label="Аяллын товч мэдээлэл" className={styles.btFacts}>
                    <div><span>Хэзээ</span><strong>{selectedTrip.season ?? "Улирлын мэдээлэл удахгүй"}</strong></div><div><span>Үнэ</span><strong>{selectedTrip.price}</strong></div><div><span>Хугацаа</span><strong>{selectedTrip.duration}</strong></div>
                  </section>
                  <section aria-label="Аяллын хөтөлбөр" className={styles.btRoute} id="trip-route">
                    <div className={styles.btHighlights}>{(selectedTrip.highlights ?? [selectedTrip.region]).map((highlight, index) => <span key={highlight}><small>0{index + 1}</small>{highlight}</span>)}</div>
                    <div className={styles.btDayList}>
                      {(selectedTrip.itinerary ?? []).map((stop, index) => {
                        const reverse = index % 2 === 1;
                        const image = index % 2 === 0 ? selectedTrip.galleryImage ?? selectedTrip.image : selectedTrip.image;
                        return <article className={`${styles.btDay} ${reverse ? styles.btDayReverse : ""}`} key={`${stop.day}-${stop.title}`}>
                          <div className={styles.btDayMedia} id={index === 0 ? "trip-media" : undefined}>
                            {index === 0 && selectedTrip.videoId ? <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" src={`https://www.youtube-nocookie.com/embed/${selectedTrip.videoId}`} title={`${selectedTrip.title} аяллын бичлэг`} /> : (
                              // biome-ignore lint/performance/noImgElement: local trip media follows the editorial reference layout
                              <img alt={selectedTrip.mediaCaption ?? selectedTrip.region} loading="lazy" src={image} />
                            )}
                            {index === 0 ? <span>{selectedTrip.mediaCaption ?? selectedTrip.region}</span> : null}
                          </div>
                          <div className={styles.btDayCopy}><p className={styles.btEyebrow}>ӨДӨР {stop.day}</p><h4>{stop.title}</h4><p>{stop.description}</p></div>
                        </article>;
                      })}
                    </div>
                  </section>
                  {selectedTrip.galleryImage ? <section aria-label="Аяллын нэмэлт зураг" className={styles.btGallery}>
                    {/* biome-ignore lint/performance/noImgElement: local trip gallery image follows the editorial reference layout */}
                    <img alt={selectedTrip.mediaCaption ?? selectedTrip.region} loading="lazy" src={selectedTrip.galleryImage} />
                    <div><p className={styles.btEyebrow}>ЗАМЫН ТЭМДЭГЛЭЛ</p><h3>{selectedTrip.mediaCaption ?? selectedTrip.region}</h3></div>
                  </section> : null}
                  <footer className={styles.btDetailFooter}>
                    <div><p className={styles.btEyebrow}>ТАНЫ АЯЛАЛ ЭНДЭЭС ЭХЭЛНЭ</p><h3>{selectedTrip.title}</h3></div>
                    <button onClick={() => document.getElementById("journey-booking")?.scrollIntoView({ behavior: "instant", block: "start" })} type="button">Захиалгын хэсэг рүү очих <ChevronRight aria-hidden="true" size={18} /></button>
                  </footer>
                </section>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
