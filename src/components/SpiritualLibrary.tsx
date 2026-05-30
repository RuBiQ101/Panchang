import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Book, Music, Flame, Sparkles } from 'lucide-react';

interface LibraryItem {
  title: string;
  titleHi: string;
  content: string;
  meaning?: string;
  meaningHi?: string;
}

interface Category {
  id: string;
  name: string;
  nameHi: string;
  icon: any;
  items: LibraryItem[];
}

const LIBRARY_DATA: Category[] = [
  {
    id: 'daily',
    name: 'Daily Rituals',
    nameHi: 'दैनिक कर्मकांड',
    icon: Sparkles,
    items: [
      {
        title: 'Pratah Smaran',
        titleHi: 'प्रातः स्मरण',
        content: 'कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती।\nकरमूले तु गोविन्दः प्रभाते करदर्शनम्॥',
        meaning: 'At the tip of the hands resides Lakshmi, in the middle Saraswati, and at the base Govinda.',
        meaningHi: 'हाथ के अग्र भाग में लक्ष्मी, मध्य में सरस्वती और मूल में भगवान गोविंद का निवास है।'
      },
      {
        title: 'Snan Mantra',
        titleHi: 'स्नान मंत्र',
        content: 'गंगे च यमुने चैव गोदावरी सरस्वति।\nनर्मदे सिन्धु कावेरी जलेऽस्मिन् सन्निधिं कुरु॥',
        meaning: 'O Holy Rivers! Please be present in this water.',
        meaningHi: 'हे पवित्र नदियों! आप सभी मेरे इस स्नान के जल में पधारें।'
      }
    ]
  },
  {
    id: 'poojan',
    name: 'Poojan',
    nameHi: 'पूजन विधि',
    icon: Book,
    items: [
      {
        title: 'Ganesh Poojan',
        titleHi: 'गणेश पूजन',
        content: 'गजाननं भूतगणादिसेवितं कपित्थजम्बूफलचारुभक्षणम्।\nउमासुतं शोकविनाशकारकं नमामि विघ्नेश्वरपादपङ्कजम्॥',
        meaning: 'I bow to the lotus feet of Ganesha, the son of Uma, the destroyer of obstacles.',
        meaningHi: 'मैं विघ्नों का नाश करने वाले, उमा के पुत्र श्री गणेश के चरण कमलों में प्रणाम करता हूँ।'
      },
      {
        title: 'Deepak Poojan',
        titleHi: 'दीपक पूजन',
        content: 'शुभं करोति कल्याणं आरोग्यं धनसंपदा।\nशत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते॥',
        meaning: 'I bow to the light of the lamp that brings auspiciousness, health, and wealth.',
        meaningHi: 'मैं उस दीपक की ज्योति को प्रणाम करता हूँ जो शुभ, कल्याण, आरोग्य और धन-संपदा प्रदान करती है।'
      }
    ]
  },
  {
    id: 'aarti',
    name: 'Aarti',
    nameHi: 'आरती',
    icon: Flame,
    items: [
      {
        title: 'Ganesh Aarti',
        titleHi: 'गणेश आरती',
        content: `जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पार्वती पिता महादेवा॥

एक दंत दयावंत चार भुजा धारी।
माथे सिंदूर सोहे मूस की सवारी॥

पान चढ़े फूल चढ़े और चढ़े मेवा।
लड्डुअन का भोग लगे सन्त करें सेवा॥

अंधन को आँख देत कोढ़िन को काया।
बांझन को पुत्र देत निर्धन को माया॥

'सूर' श्याम शरण आए सफल कीजे सेवा।
माता जाकी पार्वती पिता महादेवा॥`,
        meaning: 'Glory to Lord Ganesha, son of Parvati and Shiva. He removes obstacles and bestows blessings upon his devotees.',
        meaningHi: 'भगवान गणेश की जय हो, जो माता पार्वती और शिव के पुत्र हैं। वे विघ्नों को दूर करते हैं और अपने भक्तों को आशीर्वाद प्रदान करते हैं।'
      },
      {
        title: 'Om Jai Jagdish Hare',
        titleHi: 'ॐ जय जगदीश हरे',
        content: `ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे। 
भक्त जनों के संकट, क्षण में दूर करे॥ ॐ जय...

जो ध्यावे फल पावे, दुःख विनसे मन का। 
स्वामी दुःख विनसे मन का। 
सुख सम्पति घर आवे, कष्ट मिटे तन का॥ ॐ जय...

मात-पिता तुम मेरे, शरण गहूं किसकी। 
स्वामी शरण गहूं किसकी। 
तुम बिन और न दूजा, आस करूं जिसकी॥ ॐ जय...

तुम पूरण परमात्मा, तुम अन्तर्यामी। 
स्वामी तुम अन्तर्यामी। 
पारब्रह्म परमेश्वर, तुम सबके स्वामी॥ ॐ जय...

तुम करुणा के सागर, तुम पालनकर्ता। 
स्वामी तुम पालनकर्ता। 
मैं मूरख खल कामी, कृपा करो भर्ता॥ ॐ जय...

तुम हो एक अगोचर, सबके प्राणपति। 
स्वामी सबके प्राणपति। 
किस विधि मिलूं दयामय, तुमको मैं कुमति॥ ॐ जय...

दीनबन्धु दुःखहर्ता, तुम ठाकुर मेरे। 
स्वामी तुम ठाकुर मेरे। 
अपने हाथ उठाओ, द्वार पड़ा तेरे॥ ॐ जय...

विषय-विकार मिटाओ, पाप हरो देवा। 
स्वामी पाप हरो देवा। 
श्रद्धा-भक्ति बढ़ाओ, सन्तन की सेवा॥ ॐ जय...

तन-मन-धन सब है तेरा, स्वामी सब कुछ है तेरा। 
तेरा तुझको अर्पण, क्या लागे मेरा॥ ॐ जय...`,
        meaning: 'A universal prayer to the Lord of the Universe, asking for relief from suffering, seeking shelter in the Divine, and dedicating one\'s self entirely to God.',
        meaningHi: 'यह ब्रह्मांड के स्वामी की प्रार्थना है, जिसमें दुखों से मुक्ति, ईश्वर की शरण और अपना सर्वस्व ईश्वर को अर्पित करने की भावना प्रकट की गई है।'
      }
    ]
  },
  {
    id: 'chalisa',
    name: 'Chalisa',
    nameHi: 'चालीसा',
    icon: Music,
    items: [
      {
        title: 'Hanuman Chalisa',
        titleHi: 'हनुमान चालीसा',
        content: `श्रीगुरु चरन सरोज रज निज मनु मुकुर सुधारि।
बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥
बुद्धिहीन तनु जानिके सुमिरौं पवन-कुमार।
बल बुधि बिद्या देहु मोहिं हरहु कलेस बिकार॥

जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुँ लोक उजागर॥
राम दूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा॥
महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥
कंचन बरन बिराज सुबेसा। कानन कुंडल कुंचित केसा॥
हाथ बज्र औ ध्वजा बिराजै। काँधे मूँज जनेऊ साजै॥
संकर सुवन केसरी नंदन। तेज प्रताप महा जग बंदन॥
बिद्यावान गुणी अति चातुर। राम काज करिबे को आतुर॥
प्रभु चरित्र सुनिबे को रसिया। राम लखन सीता मन बसिया॥
सूक्ष्म रूप धरि सियहिं दिखावा। बिकट रूप धरि लंक जरावा॥
भीम रूप धरि असुर सँहारे। रामचन्द्र के काज सँवारे॥
लाय सजीवन् लखन जियाये। श्री रघुबीर हरषि उर लाये॥
रघुपति कीन्ही बहुत बड़ाई। तुम मम प्रिय भरतहि सम भाई॥
सहस बदन तुम्हरो यस गावैं। अस कहि श्रीपति कंठ लगावैं॥
सनकादिक ब्रह्मादि मुनीसा। नारद सारद सहित अहीसा॥
जम कुबेर दिगपाल जहाँ ते। कबि कोबिद कहि सके कहाँ ते॥
तुम उपकार सुग्रीवहिं कीन्हा। राम मिलाय राज पद दीन्हा॥
तुम्हरो मंत्र बिभीषन माना। लंकेस्वर भए सब जग जाना॥
जुग सहस्र जोजन पर भानू। लील्यो ताहि मधुर फल जानू॥
प्रभु मुद्रिका मेलि मुख माहीं। जलधि लाँघि गये अचरज नाहीं॥
दुर्गम काज जगत के जेते। सुगम अनुग्रह तुम्हरे तेते॥
राम दुआरे तुम रखवारे। होत न आज्ञा बिनु पैसारे॥
सब सुख लहै तुम्हारी सरना। तुम रक्षक काहू को डर ना॥
आपन तेज सम्हारो आपै। तीनों लोक हांक तें कांपै॥
भूत पिसाच निकट नहिं आवै। महाबीर जब नाम सुनावै॥
नासै रोग हरै सब पीरा। जपत निरंतर हनुमत बीरा॥
संकट तें हनुमान छुड़ावै। मन क्रम बचन ध्यान जो लावै॥
सब पर राम तपस्वी राजा। तिन के काज सकल तुम साजा॥
और मनोरथ जो कोई लावै। सोइ अमित जीवन फल पावै॥
चारों जुग परताप तुम्हारा। है परसिद्ध जगत उजियारा॥
साधु संत के तुम रखवारे। असुर निकंदन राम दुलारे॥
अष्ट सिद्धि नौ निधि के दाता। अस बर दीन जानकी माता॥
राम रसायन तुम्हरे पासा। सदा रहो रघुपति के दासा॥
तुम्हरे भजन राम को पावै। जनम जनम के दुख बिसरावै॥
अंत काल रघुबर पुर जाई। जहाँ जन्म हरि-भक्त कहाई॥
और देवता चित्त expanded न धरई। हनुमत सेइ सर्ब सुख करई॥
संकट कटै मिटै सब पीरा। जो सुमिरै हनुमत बलबीरा॥
जय जय जय हनुमान गोसाईं। कृपा करहु गुरुदेव की नाईं॥
जो सत बार पाठ कर कोई। छूटहि बंदि महा सुख होई॥
जो यह पढ़ै हनुमान चालीसा। होय सिद्धि साखी गौरीसा॥
तुलसीदास सदा हरि चेरा। कीजै नाथ हृदय मँह डेरा॥

पवनतनय संकट हरन, मंगल मूरति रूप।
राम लखन सीता सहित, हृदय बसहु सुर भूप॥`,
        meaning: 'A 40-verse hymn in praise of Lord Hanuman, highlighting his strength, devotion to Rama, and role as a protector of devotees.',
        meaningHi: 'भगवान हनुमान की स्तुति में 40 छंदों का भजन, जो उनकी शक्ति, राम के प्रति उनकी भक्ति और भक्तों के रक्षक के रूप में उनकी भूमिका को दर्शाता है।'
      },
      {
        title: 'Durga Chalisa',
        titleHi: 'दुर्गा चालीसा',
        content: `नमो नमो दुर्गे सुख करनी। नमो नमो अम्बे दुःख हरनी॥
निरंकार है ज्योति तुम्हारी। तिहूँ लोक फैली उजियारी॥
शशि ललाट मुख महाविशाला। नेत्र लाल भृकुटि विकराला॥
रूप मातु को अधिक सुहावे। दरश करत जन अति सुख पावे॥
तुम संसार शक्ति लय कीन्हा। पालन हेतु अन्न धन दीन्हा॥
अन्नपूर्णा हुई जग पाला। तुम ही आदि सुन्दरी बाला॥
प्रलयकाल सब नाशन हारी। तुम गौरी शिव शंकर प्यारी॥
शिव योगी तुम्हरे गुण गावें। ब्रह्मा विष्णु तुम्हें नित ध्यावें॥
रूप सरस्वती को तुम धारा। दे सुबुद्धि ऋषि मुनिन उबारा॥
धयो रूप नरसिंह को अम्बा। परगट भई फाड़कर खम्बा॥
रक्षा करि प्रह्लाद बचायो। हिरणाकुश को स्वर्ग पठायो॥
लक्ष्मी रूप धरो जग माहीं। श्री नारायण अंग समाहीं॥
क्षीरसिन्धु में करत विलासा। दयासिन्धु दीजै मन आसा॥
हिंगलाज में तुम्हीं भवानी। महिमा अमित न जात बखानी॥
मातंगी अरु धूमावति माता। भुवनेश्वरी बगला सुखदाता॥
श्री भैरव तारा जग तारिणी। छिन्न भाल भव दुःख निवारिणी॥
केहरि वाहन सोह भवानी। लांगुर वीर चलत अगवानी॥
कर में खप्पर खड्ग विराजै। जाको देख काल डर भाजै॥
सोहे अस्त्र और त्रिशूला। जाते उठत शत्रु हिय शूला॥
नगरकोट में तुम्हीं विराजत। तिहूँ लोक में डंका बाजत॥
शुम्भ निशुम्भ दानव तुम मारे। रक्तबीज शंखन संहारे॥
महिषासुर नृप अति अभिमानी। जेहि अघ भार मही अकुलानी॥
रूप कराल कालिका धारा। सेन सहित तुम तिहि संहारा॥
परी गाढ़ सन्तन पर जब जब। भई सहाय मातु तुम तब तब॥
अमरपुरी अरु बासव लोका। तब महिमा सब रहें अशोका॥
ज्वाला में है ज्योति तुम्हारी। तुम्हें सदा पूजें नर-नारी॥
प्रेम भक्ति से जो यश गावें। दुःख दारिद्र निकट नहिं आवें॥
ध्यावे तुम्हें जो नर मन लाई। जन्म-मरण ताको छुटि जाई॥
जोगी सुर मुनि कहत पुकारी। योग न हो बिन शक्ति तुम्हारी॥
शंकर आचारज तप कीन्हो। काम अरु क्रोध जीति सब लीन्हो॥
निशिदिन ध्यान धरो शंकर को। काहु काल नहिं सुमिरो तुमको॥
शक्ति रूप को मरम न पायो। शक्ति गयी तब मन पछतायो॥
शरणागत हुई कीर्ति बखानी। जय जय जय जगदम्ब भवानी॥
भई प्रसन्न आदि जगदम्बा। दई शक्ति नहिं कीन विलम्बा॥
मोको मातु कष्ट अति घेरो। तुम बिन कौन हरै दुःख मेरो॥
आशा तृष्णा निपट सतावें। मोह मदादिक सब बिनशावें॥
शत्रु नाश कीजै महारानी। सुमिरों इकचित तुम्हें भवानी॥
करो कृपा हे मातु दयाला। ऋद्धि-सिद्धि दै करहु निहाला॥
जब लग जियूँ दया फल पाऊँ। तुम्हरो यश मैं सदा सुनाऊँ॥
दुर्गा चालीसा जो नित गावै। सब सुख भोग परम पद पावै॥`,
        meaning: 'A prayer dedicated to Goddess Durga, who is the source of all power and the protector of the universe.',
        meaningHi: 'देवी दुर्गा को समर्पित एक प्रार्थना, जो समस्त शक्ति की स्रोत और ब्रह्मांड की रक्षक हैं।'
      },
      {
        title: 'Shiv Chalisa',
        titleHi: 'शिव चालीसा',
        content: `जय गणेश गिरिजा सुवन, मंगल मूल सुजान।
कहत अयोध्यादास तुम, देहु अभय वरदान॥

जय गिरिजापति दीन दयाला। सदा करत सन्तन प्रतिपाला॥
भाल चन्द्र सोहित नीके। कानन कुण्डल नागफनी के॥
अंग गौर शिर गंग बहाये। मुण्डमाल तन क्षार लगाये॥
वस्त्र खाल बाघम्बर सोहे। छवि को देख नाग मुनि मोहे॥
मैना मातु कि हवे दुलारी। बाम अंग सोहत छवि न्यारी॥
कर त्रिशूल सोहत छवि भारी। करत सदा शत्रुन क्षयकारी॥
नन्दी गणेश सोहैं तहँ कैंसे। सागर मध्य कमल हैं जैसे॥
कार्तिक श्याम और गणराऊ। या छवि को कहि जात न काऊ॥
देवन जबहीं जाय पुकारा। तबहीं दुख प्रभु आप निवारा॥
किया उपद्रव तारक भारी। देवन सब मिलि तुमहिं जुहारी॥
तुरत षडानन आप पठायो। लवनिमेष महँ मारि गिरायो॥
आप जलंधर असुर संहारा। सुयश तुम्हार विदित संसारा॥
त्रिपुरासुर सन युद्ध मचाई। सबहिं कृपा करि लीन बचाई॥
किया तपहिं भागीरथ भारी। पुरब प्रतिज्ञा तासु पुरारी॥
दानिन महँ तुम सम कोउ नाहीं। सेवक अस्तुति करत सदाहीं॥
वेद नाम महिमा तव गाई। अकथ अनादि भेद नहिं पाई॥
प्रकटी उदधि मन्थन में ज्वाला। जरत सुरासुर भये विहाला॥
कीन्ह दया तहँ करी सहाई। नीलकण्ठ तब नाम कहाई॥
पूजन रामचन्द्र जब कीन्हा। जीत के लंक विभीषण दीन्हा॥
सहस कमल में हो रहे धारी। कीन्ह परीक्षा तबहिं पुरारी॥
एक कमल प्रभु राखेउ जोई। कमल नयन पूजन चह सोई॥
कठिन भक्ति देखी प्रभु शंकर। भये प्रसन्न दिए इच्छित वर॥
जय जय जय अनन्त अविनाशी। करत कृपा सब के घट वासी॥
दुष्ट सकल नित मोहि सतावैं। भ्रमत रहे मन चैन न पावैं॥
त्राहि त्राहि मैं नाथ पुकारो। यहि अवसर मोहि आन उबारो॥
लै त्रिशूल शत्रुन को मारो। संकट ते मोहि आन उबारो॥
मातु पिता भ्राता सब कोई। संकट में पूछत नहिं कोई॥
स्वामी एक है आस तुम्हारी। आय हरहु अब संकट भारी॥
धन निर्धन को देत सदाहीं। जो कोई जांचे सो फल पाहीं॥
अस्तुति केहि विधि करौं तुम्हारी। क्षमहु नाथ अब चूक हमारी॥
शंकर हो संकट के नाशन। मंगल कारण विघ्न विनाशन॥
योगी यति मुनि ध्यान लगावैं। शारद नारद शीष नवावैं॥
नमो नमो जय नमः शिवाय। सुर ब्रह्मादिक पार न पाय॥
जो यह पाठ करे मन लाई। ता पर होत है शम्भु सहाई॥
ॠणियां जो कोई हो अधिकारी। पाठ करे सो पावन हारी॥
पुत्र हीन कर इच्छा कोई। निश्चय शिव प्रसाद तेही होई॥
पण्डित त्रयोदशी को लावे। ध्यान पूर्वक होम करावे॥
त्रयोदशी व्रत करै हमेशा। ताके तन नहिं रहै कलेशा॥
धूप दीप नैवेद्य चढ़ावे। शंकर सम्मुख पाठ सुनावे॥
जन्म जन्म के पाप नसावे। अन्त धाम शिवपुर में पावे॥

नित्त नेम कर प्रातः ही, पाठ करौ चालीसा।
तुम मेरी मनोकामना, पूर्ण करौ जगदीश॥
मगसर छठि हेमन्त ऋतु, संवत चौसठ जान।
अस्तुति चालीसा शिवहि, पूर्ण कीन कल्याण॥`,
        meaning: 'A hymn dedicated to Lord Shiva, describing his various forms and seeking his blessings for peace and prosperity.',
        meaningHi: 'भगवान शिव को समर्पित एक भजन, जिसमें उनके विभिन्न रूपों का वर्णन किया गया है और शांति और समृद्धि के लिए उनका आशीर्वाद मांगा गया है।'
      }
    ]
  }
];

export const SpiritualLibrary: React.FC<{ language: 'en' | 'hi' }> = ({ language }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const handleBack = () => {
    if (selectedItem) {
      setSelectedItem(null);
    } else {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="p-4 space-y-6 min-h-[70vh]">
      <div className="text-center relative">
        {selectedCategory && (
          <button 
            onClick={handleBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-saffron" />
          </button>
        )}
        <h2 className="text-2xl font-serif italic text-rose-gold-500">
          {selectedItem 
            ? (language === 'hi' ? selectedItem.titleHi : selectedItem.title)
            : selectedCategory 
              ? (language === 'hi' ? selectedCategory.nameHi : selectedCategory.name)
              : (language === 'hi' ? 'आध्यात्मिक पुस्तकालय' : 'Spiritual Library')
          }
        </h2>
        <p className="text-[10px] text-rose-gold-100/40 uppercase tracking-widest mt-1">
          {selectedItem 
            ? (language === 'hi' ? 'पाठ एवं अर्थ' : 'Text & Meaning')
            : selectedCategory 
              ? (language === 'hi' ? 'संग्रह' : 'Collection')
              : (language === 'hi' ? 'पूजा, आरती एवं मंत्र' : 'Poojan, Aarti & Mantras')
          }
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div 
            key="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-4"
          >
            {LIBRARY_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="spiritual-card p-6 flex flex-col items-center gap-3 hover:border-saffron/50 transition-all group bg-rose-gold-900/20 border-rose-gold-500/10"
              >
                <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center text-saffron group-hover:bg-saffron group-hover:text-white transition-colors">
                  <cat.icon size={24} />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider text-rose-gold-100">
                  {language === 'hi' ? cat.nameHi : cat.name}
                </span>
                <span className="text-[10px] text-rose-gold-100/40">
                  {cat.items.length} {language === 'hi' ? 'आइटम' : 'Items'}
                </span>
              </button>
            ))}
          </motion.div>
        ) : !selectedItem ? (
          <motion.div 
            key="items"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {selectedCategory.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedItem(item)}
                className="w-full spiritual-card p-4 flex justify-between items-center hover:bg-saffron/10 transition-colors bg-rose-gold-900/20 border-rose-gold-500/10"
              >
                <span className="font-hindi font-bold text-lg text-rose-gold-100">
                  {language === 'hi' ? item.titleHi : item.title}
                </span>
                <ChevronRight size={20} className="text-saffron/40" />
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="spiritual-card p-4 sm:p-6 space-y-6 bg-rose-gold-950/40 border-rose-gold-500/30 shadow-xl relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-rose-gold-500/5 to-transparent pointer-events-none" />
              
              <div className="bg-black/40 p-6 rounded-xl border border-rose-gold-500/10 shadow-inner relative z-10">
                <p className="font-hindi text-lg sm:text-xl md:text-2xl leading-relaxed text-center whitespace-pre-line text-rose-gold-50 drop-shadow-sm font-medium tracking-wide" style={{ wordSpacing: '0.1em' }}>
                  {selectedItem.content}
                </p>
              </div>
              
              {(selectedItem.meaning || selectedItem.meaningHi) && (
                <div className="space-y-3 pt-4 border-t border-rose-gold-500/20 relative z-10">
                  <h4 className="text-[10px] sm:text-xs font-bold uppercase text-saffron tracking-widest flex items-center justify-center gap-2">
                    <Sparkles size={12} />
                    {language === 'hi' ? 'भावार्थ' : 'Meaning'}
                    <Sparkles size={12} />
                  </h4>
                  <p className="text-sm sm:text-base text-rose-gold-100/80 italic leading-relaxed font-serif text-center px-4">
                    {language === 'hi' ? selectedItem.meaningHi : selectedItem.meaning}
                  </p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedItem(null)}
              className="w-full py-4 border border-rose-gold-500/30 text-rose-gold-400 bg-rose-gold-900/20 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-rose-gold-500/10 hover:border-rose-gold-500/50 transition-all active:scale-[0.98]"
            >
              {language === 'hi' ? 'वापस सूची में' : 'Back to List'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
