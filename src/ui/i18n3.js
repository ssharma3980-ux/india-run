/* Strings for Live Race */
(function () {
  const add = {
    en: {
      liveRace: 'Live Race', liveDesc: 'Race a friend at the same time over the internet. Share a 4-digit code and run side by side!',
      createRace: 'Create race', joinRace: 'Join', enterCode: '4-digit code', raceCode: 'Race code', shareCode: 'Send this code or link to your friend',
      waitingFriend: 'Waiting for your friend to join…', connecting: 'Connecting…', joined: 'joined!', startRace: 'Start race', waitHost: 'Waiting for the host to start…',
      cancel: 'Cancel', noRoom: 'No race found with this code. Check the code.', roomFull: 'This race already has 2 players.', noNet: 'Could not reach the server. Check your internet.',
      noConn: 'Could not connect the two phones. Try again, or connect both to Wi-Fi.', friendLeft: 'Your friend left the race.', retry: 'Try again',
      rematch: 'Rematch', waitRematch: 'Waiting for the host to start a rematch…', leave: 'Leave', stillRunning: 'is still running…', isOut: 'is out at',
      youWin: 'You win! 🏆', friendWins: 'wins!', draw: "It's a draw!", go: 'GO!', you: 'You', liveInvite: '🔴 Race me LIVE in INDIA RUN! Code:', city: 'City',
      raceNote: 'Whoever runs farther wins.',
    },
    hi: {
      liveRace: 'लाइव रेस', liveDesc: 'इंटरनेट से दोस्त के साथ एक ही समय पर दौड़ें। 4 अंकों का कोड भेजें और साथ-साथ दौड़ें!',
      createRace: 'रेस बनाएँ', joinRace: 'जुड़ें', enterCode: '4 अंकों का कोड', raceCode: 'रेस कोड', shareCode: 'यह कोड या लिंक दोस्त को भेजें',
      waitingFriend: 'दोस्त के जुड़ने का इंतज़ार…', connecting: 'जुड़ रहे हैं…', joined: 'जुड़ गया!', startRace: 'रेस शुरू करें', waitHost: 'होस्ट के शुरू करने का इंतज़ार…',
      cancel: 'रद्द करें', noRoom: 'इस कोड की कोई रेस नहीं मिली। कोड जाँचें।', roomFull: 'इस रेस में पहले से 2 खिलाड़ी हैं।', noNet: 'सर्वर से जुड़ नहीं पाए। इंटरनेट जाँचें।',
      noConn: 'दोनों फ़ोन जुड़ नहीं पाए। फिर कोशिश करें, या दोनों Wi-Fi से जुड़ें।', friendLeft: 'दोस्त रेस छोड़ गया।', retry: 'फिर कोशिश करें',
      rematch: 'फिर से रेस', waitRematch: 'होस्ट की नई रेस का इंतज़ार…', leave: 'बाहर निकलें', stillRunning: 'अभी दौड़ रहा है…', isOut: 'आउट हुआ',
      youWin: 'आप जीते! 🏆', friendWins: 'जीता!', draw: 'बराबरी!', go: 'दौड़ो!', you: 'आप', liveInvite: '🔴 INDIA RUN में मेरे साथ लाइव दौड़ो! कोड:', city: 'शहर',
      raceNote: 'जो ज़्यादा दूर दौड़ेगा, वही जीतेगा।',
    },
    gu: {
      liveRace: 'લાઇવ રેસ', liveDesc: 'ઇન્ટરનેટથી મિત્ર સાથે એક જ સમયે દોડો. 4 અંકનો કોડ મોકલો અને સાથે દોડો!',
      createRace: 'રેસ બનાવો', joinRace: 'જોડાઓ', enterCode: '4 અંકનો કોડ', raceCode: 'રેસ કોડ', shareCode: 'આ કોડ અથવા લિંક મિત્રને મોકલો',
      waitingFriend: 'મિત્ર જોડાય તેની રાહ…', connecting: 'જોડાઈ રહ્યા છીએ…', joined: 'જોડાયો!', startRace: 'રેસ શરૂ કરો', waitHost: 'હોસ્ટ શરૂ કરે તેની રાહ…',
      cancel: 'રદ કરો', noRoom: 'આ કોડની કોઈ રેસ મળી નહીં. કોડ તપાસો.', roomFull: 'આ રેસમાં પહેલેથી 2 ખેલાડી છે.', noNet: 'સર્વર સુધી પહોંચી શક્યા નહીં. ઇન્ટરનેટ તપાસો.',
      noConn: 'બંને ફોન જોડાઈ શક્યા નહીં. ફરી પ્રયાસ કરો, અથવા બંને Wi-Fi પર જોડાઓ.', friendLeft: 'મિત્રએ રેસ છોડી દીધી.', retry: 'ફરી પ્રયાસ કરો',
      rematch: 'ફરી રેસ', waitRematch: 'હોસ્ટની નવી રેસની રાહ…', leave: 'બહાર નીકળો', stillRunning: 'હજી દોડે છે…', isOut: 'આઉટ થયો',
      youWin: 'તમે જીત્યા! 🏆', friendWins: 'જીત્યો!', draw: 'બરાબરી!', go: 'દોડો!', you: 'તમે', liveInvite: '🔴 INDIA RUN માં મારી સાથે લાઇવ દોડો! કોડ:', city: 'શહેર',
      raceNote: 'જે વધુ દૂર દોડશે તે જીતશે.',
    },
  };
  for (const k in add) Object.assign(IR.STR[k], add[k]);
})();
