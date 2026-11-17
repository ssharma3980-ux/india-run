/* Indian culture layer: monuments (Blender models), culture fact cards, festivals, hidden treasures, power-ups */
(function () {
  const PI = Math.PI;

  /* ---------- Indian-themed power-ups ---------- */
  IR.POWERS = {
    magnet: { icon: '🦚', ring: 'rgba(40,160,200,.85)', col: '#1ea0c8' },
    shield: { icon: '🛡️', ring: 'rgba(80,170,255,.8)', col: '#4aa8ff' },
    double: { icon: '🍬', ring: 'rgba(255,170,40,.85)', col: '#ffaa28' },
    multi: { icon: '🥁', ring: 'rgba(200,60,60,.85)', col: '#e0483c' },
    boost: { icon: '💨', ring: 'rgba(255,150,30,.85)', col: '#ff961e' },
    glide: { icon: '🪁', ring: 'rgba(40,220,160,.85)', col: '#28dca0' },
    rath: { icon: '🐎', ring: 'rgba(255,215,0,.9)', col: '#ffd700' },
  };

  /* ---------- monuments modelled in Blender (tools/blender_monuments.py) ---------- */
  IR.MON = {
    war_arch: { w: 32, dp: 12, name: { en: 'War Memorial Arch', hi: 'युद्ध स्मारक द्वार', gu: 'યુદ્ધ સ્મારક દ્વાર' } },
    victory_tower: { w: 12, dp: 12, name: { en: 'Fluted Victory Tower', hi: 'विजय मीनार', gu: 'વિજય મિનાર' } },
    harbour_arch: { w: 40, dp: 18, name: { en: 'Harbour Gateway', hi: 'समुद्री प्रवेश द्वार', gu: 'દરિયાઈ પ્રવેશદ્વાર' } },
    four_minaret_gate: { w: 22, dp: 22, name: { en: 'Four-Minaret Gate', hi: 'चार मीनार द्वार', gu: 'ચાર મિનાર દ્વાર' } },
    memorial_hall: { w: 70, dp: 34, name: { en: 'Marble Memorial Hall', hi: 'संगमरमर स्मारक भवन', gu: 'આરસ સ્મારક ભવન' } },
    mausoleum: { w: 56, dp: 56, name: { en: 'White Marble Mausoleum', hi: 'सफ़ेद संगमरमर का मकबरा', gu: 'સફેદ આરસનો મકબરો' } },
    wind_palace: { w: 32, dp: 7, name: { en: 'Palace of Winds', hi: 'हवाओं का महल', gu: 'પવનનો મહેલ' } },
    lake_palace: { w: 64, dp: 40, name: { en: 'Lake Palace', hi: 'झील महल', gu: 'સરોવર મહેલ' } },
    assembly_hall: { w: 80, dp: 36, name: { en: 'Granite Assembly Hall', hi: 'ग्रेनाइट विधान भवन', gu: 'ગ્રેનાઇટ વિધાન ભવન' } },
  };
  const MATMAP = { marble: 'marble', redstone: 'stoneRed', buffstone: 'stone', yellowstone: 'stone', limestone: 'stonePlain', pink: 'stonePink', white: 'whitePlaster', granite: 'stoneGrey', gold: 'gold', dark: 'black' };
  IR.Monuments = {
    models: {},
    async load(onProgress) {
      const keys = Object.keys(IR.MON); let n = 0;
      const loader = new THREE.GLTFLoader();
      await Promise.all(keys.map(async (k) => {
        try {
          const g = await loader.loadAsync(IR.assetURL('monuments/' + k + '.glb'));
          g.scene.traverse((m) => {
            if (!m.isMesh) return;
            const nm = (m.material && m.material.name || '').replace(/\.\d+$/, '');
            const mapped = IR.M[MATMAP[nm]];
            if (mapped) m.material = mapped;
            m.castShadow = true; m.receiveShadow = true;
          });
          this.models[k] = g.scene;
        } catch (e) { console.warn('monument', k, e); }
        onProgress && onProgress(++n / keys.length);
      }));
    },
  };

  /* ---------- per-city culture: monuments, "Did you know?" facts, treasures ---------- */
  const C = (IR.CULTURE = {});
  const F = (en, hi, gu) => ({ en, hi, gu });
  C.varanasi = { mon: [], facts: [F('Varanasi has more than 80 ghats — stone steps leading down to the Ganga.', 'वाराणसी में 80 से ज़्यादा घाट हैं — गंगा तक जाती पत्थर की सीढ़ियाँ।', 'વારાણસીમાં 80થી વધુ ઘાટ છે — ગંગા સુધી જતાં પથ્થરનાં પગથિયાં.'), F('The evening Ganga Aarti at Dashashwamedh Ghat is famous all over the world.', 'दशाश्वमेध घाट की संध्या गंगा आरती पूरी दुनिया में प्रसिद्ध है।', 'દશાશ્વમેધ ઘાટની સંધ્યા ગંગા આરતી આખી દુનિયામાં જાણીતી છે.')],
    tr: [['🧣', F('Banarasi Silk', 'बनारसी सिल्क', 'બનારસી સિલ્ક')], ['🏺', F('Brass Lota', 'पीतल का लोटा', 'પિત્તળનો લોટો')], ['🎺', F('Shehnai', 'शहनाई', 'શરણાઈ')]] };
  C.agra = { mon: [{ k: 'mausoleum', place: 'right', u: 92, water: true, s: 0.9 }], facts: [F('The Taj Mahal was built by Shah Jahan in memory of Mumtaz Mahal and is a UNESCO World Heritage Site.', 'ताज महल शाहजहाँ ने मुमताज़ महल की याद में बनवाया था; यह यूनेस्को विश्व धरोहर है।', 'તાજમહેલ શાહજહાંએ મુમતાઝ મહેલની યાદમાં બંધાવ્યો હતો; તે યુનેસ્કો વિશ્વ ધરોહર છે.'), F('Agra Fort, made of red sandstone, is also a UNESCO World Heritage Site.', 'लाल बलुआ पत्थर से बना आगरा किला भी यूनेस्को विश्व धरोहर है।', 'લાલ પથ્થરનો આગ્રાનો કિલ્લો પણ યુનેસ્કો વિશ્વ ધરોહર છે.')],
    tr: [['💎', F('Marble Inlay Box', 'संगमरमर जड़ाऊ डिब्बा', 'આરસની જડતર પેટી')], ['🍬', F('Agra Petha', 'आगरा का पेठा', 'આગ્રાનો પેઠો')], ['👞', F('Leather Juttis', 'चमड़े की जूतियाँ', 'ચામડાની મોજડી')]] };
  C.delhi = { mon: [{ k: 'war_arch', place: 'span', s: 0.75 }, { k: 'victory_tower', place: 'left', u: 13, s: 0.9 }], facts: [F('India Gate is a 42-metre war memorial arch in New Delhi, completed in 1931.', 'इंडिया गेट नई दिल्ली में 42 मीटर ऊँचा युद्ध स्मारक है, जो 1931 में बना।', 'ઇન્ડિયા ગેટ નવી દિલ્હીમાં 42 મીટર ઊંચું યુદ્ધ સ્મારક છે, જે 1931માં બન્યું.'), F('The Qutub Minar is about 73 metres tall and built mainly of red sandstone.', 'क़ुतुब मीनार लगभग 73 मीटर ऊँची है और मुख्यतः लाल बलुआ पत्थर से बनी है।', 'કુતુબ મિનાર આશરે 73 મીટર ઊંચો છે અને મુખ્યત્વે લાલ પથ્થરનો બનેલો છે.'), F('The Red Fort in Delhi was built by Shah Jahan and is a UNESCO World Heritage Site.', 'दिल्ली का लाल किला शाहजहाँ ने बनवाया था; यह यूनेस्को विश्व धरोहर है।', 'દિલ્હીનો લાલ કિલ્લો શાહજહાંએ બંધાવ્યો હતો; તે યુનેસ્કો વિશ્વ ધરોહર છે.')],
    tr: [['🗝️', F('Old Fort Key', 'पुराने किले की चाबी', 'જૂના કિલ્લાની ચાવી')], ['🥨', F('Chandni Chowk Jalebi', 'चांदनी चौक की जलेबी', 'ચાંદની ચોકની જલેબી')], ['🪙', F('Ancient Coin', 'प्राचीन सिक्का', 'પ્રાચીન સિક્કો')]] };
  C.amritsar = { mon: [], facts: [F('Amritsar is home to the Harmandir Sahib (Golden Temple), whose community kitchen serves free meals to everyone.', 'अमृतसर में हरमंदिर साहिब (स्वर्ण मंदिर) है, जिसका लंगर सबको मुफ़्त भोजन देता है।', 'અમૃતસરમાં હરમંદિર સાહિબ (સુવર્ણ મંદિર) છે, જેનું લંગર સૌને મફત ભોજન આપે છે.'), F('Phulkari is a bright flower embroidery from Punjab.', 'फुलकारी पंजाब की रंग-बिरंगी फूलों वाली कढ़ाई है।', 'ફૂલકારી પંજાબની રંગબેરંગી ફૂલોવાળી ભરતકામની કળા છે.')],
    tr: [['🧣', F('Phulkari Dupatta', 'फुलकारी दुपट्टा', 'ફૂલકારી દુપટ્ટો')], ['🪕', F('Tumbi', 'तुम्बी', 'તુંબી')], ['🫓', F('Amritsari Kulcha', 'अमृतसरी कुलचा', 'અમૃતસરી કુલચા')]] };
  C.kashmir = { mon: [], facts: [F('Shikaras are the wooden boats that glide across Dal Lake in Srinagar.', 'शिकारे लकड़ी की नावें हैं जो श्रीनगर की डल झील पर चलती हैं।', 'શિકારા લાકડાની હોડીઓ છે જે શ્રીનગરના દાલ સરોવરમાં ફરે છે.'), F('Kashmir is famous for saffron (kesar) and soft Pashmina shawls.', 'कश्मीर केसर और मुलायम पश्मीना शॉल के लिए प्रसिद्ध है।', 'કાશ્મીર કેસર અને મુલાયમ પશ્મીના શાલ માટે જાણીતું છે.')],
    tr: [['🧣', F('Pashmina Shawl', 'पश्मीना शॉल', 'પશ્મીના શાલ')], ['🫖', F('Kahwa Samovar', 'कहवा समोवार', 'કહવા સમોવાર')], ['🌸', F('Saffron Strands', 'केसर के धागे', 'કેસરના તાંતણા')]] };
  C.jaipur = { mon: [{ k: 'wind_palace', place: 'left', u: 2.4, s: 0.62 }], facts: [F('Hawa Mahal was built in 1799 and has 953 small windows called jharokhas.', 'हवा महल 1799 में बना था और इसमें 953 छोटी खिड़कियाँ (झरोखे) हैं।', 'હવા મહેલ 1799માં બન્યો હતો અને તેમાં 953 નાની બારીઓ (ઝરૂખા) છે.'), F('Jaipur was painted pink in 1876 to welcome a royal visitor — so it is called the Pink City.', 'जयपुर को 1876 में एक शाही मेहमान के स्वागत में गुलाबी रंगा गया — इसलिए यह गुलाबी नगरी है।', 'જયપુરને 1876માં શાહી મહેમાનના સ્વાગત માટે ગુલાબી રંગાયું — તેથી તે ગુલાબી નગરી કહેવાય છે.')],
    tr: [['🏺', F('Blue Pottery Vase', 'ब्लू पॉटरी फूलदान', 'બ્લૂ પોટરી ફૂલદાની')], ['🎎', F('Kathputli Puppet', 'कठपुतली', 'કઠપૂતળી')], ['💍', F('Lac Bangles', 'लाख की चूड़ियाँ', 'લાખની બંગડીઓ')]] };
  C.udaipur = { mon: [{ k: 'lake_palace', place: 'right', u: 34, water: true, s: 0.7 }], facts: [F('Udaipur is called the City of Lakes; the Lake Palace stands on an island in Lake Pichola.', 'उदयपुर को झीलों का शहर कहते हैं; झील महल पिछोला झील के एक टापू पर है।', 'ઉદયપુરને સરોવરોનું શહેર કહે છે; સરોવર મહેલ પિછોલા સરોવરના ટાપુ પર છે.'), F('Mewar miniature paintings from Udaipur use very fine brushes and natural colours.', 'उदयपुर की मेवाड़ लघु चित्रकला बहुत बारीक ब्रश और प्राकृतिक रंगों से बनती है।', 'ઉદયપુરની મેવાડ લઘુચિત્રકળા ખૂબ બારીક પીંછી અને કુદરતી રંગોથી બને છે.')],
    tr: [['🖼️', F('Miniature Painting', 'लघु चित्र', 'લઘુચિત્ર')], ['🛡️', F('Mewar Shield', 'मेवाड़ ढाल', 'મેવાડની ઢાલ')], ['🏮', F('Boat Lantern', 'नाव की लालटेन', 'હોડીનું ફાનસ')]] };
  C.ahmedabad = { mon: [], facts: [F('Ahmedabad became India\'s first UNESCO World Heritage City in 2017.', 'अहमदाबाद 2017 में भारत का पहला यूनेस्को विश्व धरोहर शहर बना।', 'અમદાવાદ 2017માં ભારતનું પહેલું યુનેસ્કો વિશ્વ ધરોહર શહેર બન્યું.'), F('On Uttarayan (14 January), the whole sky over Gujarat fills with kites.', 'उत्तरायण (14 जनवरी) पर गुजरात का पूरा आसमान पतंगों से भर जाता है।', 'ઉત્તરાયણ (14 જાન્યુઆરી)એ આખું ગુજરાતનું આકાશ પતંગોથી ભરાઈ જાય છે.'), F('The Adalaj stepwell near Ahmedabad was built in 1499 to store water.', 'अहमदाबाद के पास अडालज की बावड़ी 1499 में पानी जमा करने के लिए बनी।', 'અમદાવાદ પાસેની અડાલજની વાવ 1499માં પાણી સંઘરવા બની હતી.')],
    tr: [['🧵', F('Patola Silk', 'पटोला सिल्क', 'પટોળું')], ['🪁', F('Kite & Manja', 'पतंग और मांझा', 'પતંગ અને માંજો')], ['🧶', F('Kutchi Embroidery', 'कच्छी कढ़ाई', 'કચ્છી ભરતકામ')]] };
  C.mumbai = { mon: [{ k: 'harbour_arch', place: 'right', u: 20, water: true, s: 0.75 }], facts: [F('The Gateway of India in Mumbai was completed in 1924 on the waterfront.', 'मुंबई का गेटवे ऑफ़ इंडिया 1924 में समुद्र किनारे बनकर तैयार हुआ।', 'મુંબઈનું ગેટવે ઑફ ઇન્ડિયા 1924માં દરિયાકિનારે તૈયાર થયું.'), F('At night the curved lights of Marine Drive look like a necklace — the Queen\'s Necklace.', 'रात में मरीन ड्राइव की रोशनी हार जैसी दिखती है — क्वीन्स नेकलेस।', 'રાત્રે મરીન ડ્રાઇવની લાઇટો હાર જેવી દેખાય છે — ક્વીન્સ નેકલેસ.'), F('Mumbai\'s dabbawalas deliver about two lakh tiffin lunches every day.', 'मुंबई के डब्बावाले हर दिन लगभग दो लाख टिफ़िन पहुँचाते हैं।', 'મુંબઈના ડબ્બાવાળા રોજ આશરે બે લાખ ટિફિન પહોંચાડે છે.')],
    tr: [['🍱', F('Dabbawala Tiffin', 'डब्बावाला टिफ़िन', 'ડબ્બાવાળાનું ટિફિન')], ['🍔', F('Vada Pav', 'वड़ा पाव', 'વડાપાંઉ')], ['🎞️', F('Film Reel', 'फ़िल्म रील', 'ફિલ્મ રીલ')]] };
  C.hyderabad = { mon: [{ k: 'four_minaret_gate', place: 'span', s: 0.62 }], facts: [F('The Charminar in Hyderabad was built in 1591 and has four tall minarets.', 'हैदराबाद की चारमीनार 1591 में बनी और इसकी चार ऊँची मीनारें हैं।', 'હૈદરાબાદનો ચારમિનાર 1591માં બન્યો અને તેના ચાર ઊંચા મિનારા છે.'), F('Hyderabad is called the City of Pearls; Laad Bazaar is famous for bangles.', 'हैदराबाद को मोतियों का शहर कहते हैं; लाड बाज़ार चूड़ियों के लिए प्रसिद्ध है।', 'હૈદરાબાદને મોતીઓનું શહેર કહે છે; લાડ બજાર બંગડીઓ માટે જાણીતું છે.')],
    tr: [['📿', F('Pearl Necklace', 'मोतियों का हार', 'મોતીનો હાર')], ['💍', F('Laad Bazaar Bangles', 'लाड बाज़ार की चूड़ियाँ', 'લાડ બજારની બંગડીઓ')], ['☕', F('Irani Chai Cup', 'ईरानी चाय का कप', 'ઈરાની ચાનો કપ')]] };
  C.bengaluru = { mon: [{ k: 'assembly_hall', place: 'left', u: 22, s: 0.55 }], facts: [F('Vidhana Soudha, the seat of Karnataka\'s legislature, was completed in 1956.', 'कर्नाटक विधानमंडल का भवन विधान सौधा 1956 में पूरा हुआ।', 'કર્ણાટક વિધાનસભાનું ભવન વિધાન સૌધ 1956માં પૂરું થયું.'), F('Bengaluru is known as the Garden City; Lalbagh is its famous botanical garden.', 'बेंगलुरु को बाग़ों का शहर कहते हैं; लालबाग़ इसका प्रसिद्ध वनस्पति उद्यान है।', 'બેંગલુરુને બગીચાઓનું શહેર કહે છે; લાલબાગ તેનો જાણીતો વનસ્પતિ ઉદ્યાન છે.')],
    tr: [['🧣', F('Mysore Silk', 'मैसूर सिल्क', 'મૈસુર સિલ્ક')], ['🪀', F('Channapatna Toy', 'चन्नपटना खिलौना', 'ચન્નપટના રમકડું')], ['☕', F('Filter Coffee', 'फ़िल्टर कॉफ़ी', 'ફિલ્ટર કૉફી')]] };
  C.chennai = { mon: [], facts: [F('Marina Beach in Chennai is one of the longest city beaches in the world.', 'चेन्नई का मरीना बीच दुनिया के सबसे लंबे शहरी समुद्र तटों में से एक है।', 'ચેન્નઈનો મરીના બીચ દુનિયાના સૌથી લાંબા શહેરી દરિયાકિનારામાંનો એક છે.'), F('Gopurams are the tall, colourful gateway towers of South Indian temples.', 'गोपुरम दक्षिण भारतीय मंदिरों के ऊँचे, रंगीन प्रवेश-द्वार मीनार हैं।', 'ગોપુરમ દક્ષિણ ભારતીય મંદિરોના ઊંચા, રંગીન પ્રવેશદ્વાર મિનાર છે.')],
    tr: [['🧣', F('Kanchipuram Silk', 'कांचीपुरम सिल्क', 'કાંચીપુરમ સિલ્ક')], ['🪕', F('Veena', 'वीणा', 'વીણા')], ['🎨', F('Kolam Powder', 'कोलम चूर्ण', 'કોલમ પાઉડર')]] };
  C.kochi = { mon: [], facts: [F('Kochi\'s giant Chinese fishing nets are lowered into the water using heavy stone weights.', 'कोच्चि के बड़े चीनी मछली जाल भारी पत्थरों के सहारे पानी में डाले जाते हैं।', 'કોચીની મોટી ચીની માછીમારીની જાળ ભારે પથ્થરોના સહારે પાણીમાં ઉતારાય છે.'), F('In Kerala\'s snake-boat races, more than 100 rowers paddle one long boat.', 'केरल की सर्प-नौका दौड़ में 100 से ज़्यादा नाविक एक लंबी नाव चलाते हैं।', 'કેરળની સર્પ-નૌકા સ્પર્ધામાં 100થી વધુ નાવિકો એક લાંબી હોડી ચલાવે છે.')],
    tr: [['🎭', F('Kathakali Mask', 'कथकली मुखौटा', 'કથકલી મહોરું')], ['🌶️', F('Spice Box', 'मसालों का डिब्बा', 'મસાલાનો ડબ્બો')], ['🛶', F('Snake-boat Oar', 'सर्प-नौका की पतवार', 'સર્પ-નૌકાનું હલેસું')]] };
  C.kolkata = { mon: [{ k: 'memorial_hall', place: 'left', u: 26, s: 0.62, pad: true }], facts: [F('The Victoria Memorial in Kolkata is made of white Makrana marble and opened in 1921.', 'कोलकाता का विक्टोरिया मेमोरियल सफ़ेद मकराना संगमरमर से बना है और 1921 में खुला।', 'કોલકાતાનું વિક્ટોરિયા મેમોરિયલ સફેદ મકરાણા આરસનું છે અને 1921માં ખુલ્યું.'), F('Howrah Bridge is a giant steel cantilever bridge over the Hooghly, opened in 1943.', 'हावड़ा ब्रिज हुगली नदी पर स्टील का विशाल कैंटिलीवर पुल है, जो 1943 में खुला।', 'હાવડા બ્રિજ હુગલી નદી પરનો સ્ટીલનો વિશાળ કેન્ટિલીવર પુલ છે, જે 1943માં ખુલ્યો.'), F('Kolkata still runs India\'s only working tram network.', 'कोलकाता में आज भी भारत का इकलौता चालू ट्राम नेटवर्क है।', 'કોલકાતામાં આજે પણ ભારતનું એકમાત્ર ચાલુ ટ્રામ નેટવર્ક છે.')],
    tr: [['🍡', F('Rosogolla', 'रसगुल्ला', 'રસગુલ્લા')], ['🐎', F('Terracotta Horse', 'टेराकोटा घोड़ा', 'ટેરાકોટા ઘોડો')], ['🎫', F('Tram Ticket', 'ट्राम टिकट', 'ટ્રામ ટિકિટ')]] };
  C.puri = { mon: [], facts: [F('Puri\'s Rath Yatra pulls giant wooden chariots through the streets every year.', 'पुरी की रथ यात्रा में हर साल विशाल लकड़ी के रथ सड़कों पर खींचे जाते हैं।', 'પુરીની રથયાત્રામાં દર વર્ષે વિશાળ લાકડાના રથ રસ્તાઓ પર ખેંચાય છે.'), F('Pattachitra is a traditional cloth painting from Odisha.', 'पट्टचित्र ओडिशा की पारंपरिक कपड़े पर चित्रकला है।', 'પટ્ટચિત્ર ઓડિશાની પરંપરાગત કાપડ પરની ચિત્રકળા છે.')],
    tr: [['🖼️', F('Pattachitra', 'पट्टचित्र', 'પટ્ટચિત્ર')], ['🐚', F('Sand-art Shell', 'रेत कला शंख', 'રેતી-કળા શંખ')], ['☂️', F('Pipli Umbrella', 'पिपली छाता', 'પિપલી છત્રી')]] };

  /* ---------- festivals ---------- */
  IR.FESTIVALS = {
    diwali: { icon: '🪔', token: '🪔', name: F('Diwali', 'दिवाली', 'દિવાળી'), tokenName: F('diyas', 'दीये', 'દીવા'), night: true, fireworks: true,
      fact: F('Diwali, the festival of lights, is celebrated with diyas, rangoli and fireworks.', 'दिवाली रोशनी का त्योहार है — दीये, रंगोली और आतिशबाज़ी के साथ।', 'દિવાળી પ્રકાશનો તહેવાર છે — દીવા, રંગોળી અને આતશબાજી સાથે.') },
    holi: { icon: '🎨', token: '🎨', name: F('Holi', 'होली', 'હોળી'), tokenName: F('colour bowls', 'रंग की कटोरियाँ', 'રંગની વાટકીઓ'), puffs: true,
      fact: F('Holi, the festival of colours, welcomes spring with gulal and water colours.', 'होली रंगों का त्योहार है — गुलाल और रंगों से वसंत का स्वागत।', 'હોળી રંગોનો તહેવાર છે — ગુલાલ અને રંગોથી વસંતનું સ્વાગત.') },
    navratri: { icon: '💃', token: '🪘', name: F('Navratri', 'नवरात्रि', 'નવરાત્રિ'), tokenName: F('dhols', 'ढोल', 'ઢોલ'), night: true,
      fact: F('During Navratri, Gujarat dances Garba and Dandiya for nine nights.', 'नवरात्रि में गुजरात नौ रातों तक गरबा और डांडिया करता है।', 'નવરાત્રિમાં ગુજરાત નવ રાત સુધી ગરબા અને દાંડિયા રમે છે.') },
    uttarayan: { icon: '🪁', token: '🪁', name: F('Uttarayan', 'उत्तरायण', 'ઉત્તરાયણ'), tokenName: F('kites', 'पतंगें', 'પતંગ'), kites: true,
      fact: F('Uttarayan (Makar Sankranti) is celebrated with kite flying on 14 January.', 'उत्तरायण (मकर संक्रांति) 14 जनवरी को पतंग उड़ाकर मनाया जाता है।', 'ઉત્તરાયણ (મકર સંક્રાંતિ) 14 જાન્યુઆરીએ પતંગ ચગાવીને ઉજવાય છે.') },
    onam: { icon: '🌼', token: '🌼', name: F('Onam', 'ओणम', 'ઓણમ'), tokenName: F('flowers', 'फूल', 'ફૂલ'),
      fact: F('Onam is Kerala\'s harvest festival, with flower carpets (pookalam) and boat races.', 'ओणम केरल का फ़सल उत्सव है — फूलों की रंगोली (पूकलम) और नौका दौड़ के साथ।', 'ઓણમ કેરળનો પાકનો તહેવાર છે — ફૂલોની રંગોળી (પૂકલમ) અને હોડી સ્પર્ધા સાથે.') },
  };
  IR.FEST_ORDER = ['diwali', 'holi', 'navratri', 'uttarayan', 'onam'];
  IR.festivalOfDay = () => { const d = new Date(), doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); return IR.FEST_ORDER[doy % IR.FEST_ORDER.length]; };

  const nightAtmos = { top: '#0a0f2e', hor: '#3a2456', bot: '#1a1430', sun: '#ffb070', sunDir: [0.3, -0.04, -1], phys: { turb: 2, ray: 1, mie: 0.005, g: 0.8 }, skyExp: 0.9, sunI: 0.55, hemiSky: '#6a62b0', hemiGround: '#2a1a24', hemiI: 0.75, fog: '#1c1636', fogNear: 30, fogFar: 230, exposure: 1.35, cloud: 0.25, cloudCol: '#3a3060' };
  IR.festAtmos = (th, key) => {
    const f = IR.FESTIVALS[key]; if (!f) return th.atmos;
    if (f.night) return Object.assign({}, th.atmos, nightAtmos);
    if (key === 'holi') return Object.assign({}, th.atmos, { cloud: 0.2, exposure: (th.atmos.exposure || 1) * 1.05 });
    return th.atmos;
  };

  /* decals (rangoli, pookalam, colour splash) painted on canvas */
  const decalCache = {};
  function decal(kind) {
    if (decalCache[kind]) return decalCache[kind];
    const S = 256, c = IR.tex.cv(S), x = c.getContext('2d'), r = IR.rng(kind.length * 31);
    x.translate(S / 2, S / 2);
    if (kind === 'splash') {
      for (let i = 0; i < 9; i++) { x.fillStyle = IR.pick(r, ['#ff2d7a', '#ffd400', '#2dd4ff', '#7a2dff', '#3ddc5a', '#ff7a1a']); x.globalAlpha = 0.75; x.beginPath(); x.arc((r() - 0.5) * 160, (r() - 0.5) * 160, 20 + r() * 40, 0, 7); x.fill(); }
    } else {
      const rings = kind === 'pookalam' ? ['#ffeb3b', '#ff9800', '#e53935', '#fff8e1', '#8bc34a', '#ff5722', '#ffc107'] : ['#ff3d7f', '#ffd400', '#00c2ff', '#ffffff', '#7c3aed', '#ff7a00', '#22c55e'];
      for (let i = rings.length; i > 0; i--) {
        x.fillStyle = rings[i - 1]; x.beginPath();
        const R = (i / rings.length) * 124, petals = 8 + i * 2;
        for (let a = 0; a <= petals * 2; a++) { const ang = (a / (petals * 2)) * Math.PI * 2, rr = a % 2 ? R : R * 0.86; x.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
        x.fill();
      }
      x.fillStyle = '#fff'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * 60, Math.sin(a) * 60, 6, 0, 7); x.fill(); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return (decalCache[kind] = new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  }

  /* festival decorations added to each run (called from world.js) */
  IR.festDecor = (c, run, key) => {
    const M = IR.M, P = IR.P, r = c.r, L = run.L;
    const a0 = run.i === 0 ? 10 : 8, a1 = L - 8;
    if (key === 'diwali') {
      for (let d = a0; d < a1; d += 2.4) for (const sx of [-3.9, 3.9]) P.diya(c, sx, 0.13, d);
      for (let d = a0 + 10; d < a1; d += 26) {
        P.garland(c, -4, 5.2, d, 4, 5.2, d, 0.8, 30, 0.06);
        for (let k = -3; k <= 3; k += 1.5) { c.box(M.lampGlow, 0.32, 0.45, 0.32, k, 4.2 - Math.abs(k) * 0.08, d); c.glow(k, 4.2, d, 2.6); }
      }
    } else if (key === 'holi') {
      for (let d = a0; d < a1; d += 5 + r() * 5) { const sx = r() < 0.5 ? -3.6 : 3.6; c.put(IR.pick(r, M.gopuram.concat(M.awning)), IR.G.cone, sx, 0.25, d, 0, 0, 0, 0.45, 0.5, 0.45); }
      for (let d = a0 + 6; d < a1; d += 22) P.garland(c, -4, 4.6, d, 4, 4.6, d, 0.7, 26, 0.07);
    } else if (key === 'navratri') {
      for (let d = a0 + 4; d < a1; d += 12) for (let k = 0; k <= 16; k++) { const x = -4 + k * 0.5, y = 5 - Math.sin((k / 16) * PI) * 0.8; c.put(M.lampGlow, IR.G.sphLo, x, y, d, 0, 0, 0, 0.07); c.glow(x, y, d, 1.2); }
      for (let d = a0; d < a1; d += 3) for (const sx of [-3.9, 3.9]) { c.put(M.lampGlow, IR.G.sphLo, sx, 0.25, d, 0, 0, 0, 0.06); c.glow(sx, 0.25, d, 1); }
    } else if (key === 'uttarayan') {
      for (let d = a0; d < a1; d += 6) P.kite(c, (r() < 0.5 ? -1 : 1) * (6 + r() * 30), 14 + r() * 22, d, IR.pick(r, ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ff7043']));
    }
    // path decals (rangoli / pookalam / colour splash)
    const dk = key === 'onam' ? 'pookalam' : key === 'holi' ? 'splash' : key === 'diwali' || key === 'navratri' ? 'rangoli' : null;
    if (dk) {
      const gaps = run.gaps || [];
      for (let d = a0 + 14; d < a1 - 6; d += 18 + r() * 10) {
        if (gaps.some(([g0, g1]) => d > g0 - 2 && d < g1 + 2)) continue;
        const m = new THREE.Mesh(IR.G.plane, decal(dk)); m.rotation.x = -PI / 2; m.position.set((Math.floor(r() * 3) - 1) * 2.3, 0.02, -d); m.scale.setScalar(2.2); m.receiveShadow = true; c.group.add(m);
      }
    }
  };

  /* treasure chest model */
  IR.makeChest = () => {
    const g = new THREE.Group(), b = new IR.Batcher(), c = IR.P.ctx(b, IR.rng(5), g), M = IR.M;
    c.box(M.woodDark, 0.8, 0.45, 0.55, 0, 0.22, 0); c.box(M.gold, 0.84, 0.06, 0.59, 0, 0.42, 0); c.box(M.gold, 0.84, 0.06, 0.59, 0, 0.04, 0);
    c.put(M.woodDark, IR.G.cyl, 0, 0.45, 0, 0, 0, PI / 2, 0.28, 0.8, 0.28); for (const x of [-0.3, 0.3]) c.put(M.gold, IR.G.torus, x, 0.45, 0, 0, PI / 2, 0, 0.29, 0.29, 0.3);
    c.box(M.gold, 0.12, 0.14, 0.04, 0, 0.36, -0.3);
    b.build(g); IR.addGlows(g, [0, 0.6, 0, 3.2], '#ffd36a');
    return g;
  };
})();
