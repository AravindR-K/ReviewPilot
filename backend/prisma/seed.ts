import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ReviewPilot database...');

  // Seed AgentStatus
  const agentIds = ['collector', 'analyzer', 'responder', 'action', 'insights'];
  for (const id of agentIds) {
    await prisma.agentStatus.upsert({
      where: { id },
      update: {},
      create: { id, isActive: true, processedCount: 0 },
    });
  }
  console.log('✅ Agent statuses seeded');

  // Seed 50 sample reviews
  const reviews = [
    // === POSITIVE ENGLISH (8) ===
    {
      platform: 'google',
      platformId: 'goog-rev-001',
      customerName: 'Priya Sharma',
      rating: 5,
      reviewText: 'Absolutely loved the dosa here! The coconut chutney was fresh and the sambar had the perfect balance of spices. Best South Indian food in the city. Will definitely come back!',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-001',
      customerName: 'Rahul Menon',
      rating: 5,
      reviewText: 'The biryani was outstanding! Perfectly cooked rice, tender meat, and the raita complemented it so well. Delivery was super fast too. Highly recommend Spice Garden!',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-001',
      customerName: 'Anita Desai',
      rating: 4,
      reviewText: 'Great filter coffee and the vada was crispy on the outside, soft inside. Just like my grandmother used to make. The ambiance is cozy and the staff is very polite.',
      status: 'new_raw',
    },
    {
      platform: 'google',
      platformId: 'goog-rev-002',
      customerName: 'Karthik Rajan',
      rating: 5,
      reviewText: 'This place never disappoints! Had the thali today and every single dish was bursting with flavor. The rasam is to die for. Perfect portions and very reasonable pricing.',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'Deepa Nair',
      rating: 4,
      reviewText: 'Ordered the family pack for a weekend gathering. Everyone loved the food! The chettinad chicken was spicy and flavorful. Packaging was neat and food arrived hot.',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-002',
      customerName: 'Vikram Singh',
      rating: 5,
      reviewText: 'Been ordering from Spice Garden every week for the past 3 months. Consistency is their strength — the idli is always soft, the chutney always fresh. My go-to restaurant.',
      status: 'new_raw',
    },
    {
      platform: 'google',
      platformId: 'goog-rev-003',
      customerName: 'Meera Iyer',
      rating: 4,
      reviewText: 'Lovely place for a family dinner. The paneer butter masala was creamy and delicious. Kids loved the plain dosa. Staff was attentive and friendly. Good hygiene standards.',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-002',
      customerName: 'Arjun Reddy',
      rating: 5,
      reviewText: 'The weekend special fish curry was phenomenal! Perfectly seasoned and the fish was so fresh. Combined with steamed rice, it was a divine experience. Thank you Spice Garden!',
      status: 'new_raw',
    },

    // === NEGATIVE ENGLISH (8) ===
    {
      platform: 'swiggy',
      platformId: 'swg-rev-003',
      customerName: 'Neha Gupta',
      rating: 1,
      reviewText: 'Worst experience ever. The chicken biryani was completely bland and the rice was overcooked and mushy. For the price they charge, this is unacceptable. Never ordering again.',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-003',
      customerName: 'Suresh Kumar',
      rating: 2,
      reviewText: 'Waited 90 minutes for delivery. By the time food arrived, everything was cold and soggy. The packaging was torn and gravy had leaked everywhere. Extremely disappointed.',
      status: 'new_raw',
    },
    {
      platform: 'google',
      platformId: 'goog-rev-004',
      customerName: 'Fatima Khan',
      rating: 1,
      reviewText: 'The portion sizes have shrunk drastically. Paid 350 rupees for a thali that barely had any food. The dal was watery and the roti was stale. This used to be a good restaurant.',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'Ravi Krishnan',
      rating: 2,
      reviewText: 'The staff was incredibly rude. When I pointed out that my order was wrong, the waiter just shrugged and walked away. The manager was no better. Very unprofessional behavior.',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-004',
      customerName: 'Lakshmi Venkat',
      rating: 1,
      reviewText: 'The sambar tasted like it was made yesterday and reheated. The idli was hard as a rock. How can a South Indian restaurant mess up basic idli sambar? Terrible quality control.',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-004',
      customerName: 'Amit Patel',
      rating: 2,
      reviewText: 'Overpriced for what you get. Rs 500 for a dosa that was thin, dry, and tasted like cardboard. The chutney had a strange sour taste. There are much better options nearby for less money.',
      status: 'new_raw',
    },
    {
      platform: 'google',
      platformId: 'goog-rev-005',
      customerName: 'Divya Ramaswamy',
      rating: 1,
      reviewText: 'Ordered online and received the completely wrong order. Called customer service three times and nobody picked up. When I finally got through, they refused to replace or refund. Disgraceful.',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-005',
      customerName: 'Mohammed Ismail',
      rating: 2,
      reviewText: 'The packaging was so bad that half the food was wasted. The container lids were loose and the curry leaked into the rice. Even the delivery bag was dripping. Please fix your packaging!',
      status: 'new_raw',
    },

    // === NEUTRAL / MIXED ENGLISH (5) ===
    {
      platform: 'google',
      platformId: 'goog-rev-006',
      customerName: 'Sneha Pillai',
      rating: 3,
      reviewText: 'Food was decent but nothing extraordinary. The dosa was good but the sambar lacked flavor. Service was quick though, and the place was clean. Average experience overall.',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-005',
      customerName: 'Arun Joshi',
      rating: 3,
      reviewText: 'The taste of the food was excellent as always, but the delivery took forever. Over an hour for something that usually takes 30 minutes. Food quality is great, delivery needs improvement.',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'Kavitha Subramanian',
      rating: 3,
      reviewText: 'Love their biryani but the portions have definitely gotten smaller. Also the price went up by 50 rupees since last month. The quality is still good though, so I will keep ordering.',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-006',
      customerName: 'Raj Malhotra',
      rating: 3,
      reviewText: 'Good food, terrible packaging. The paneer tikka was delicious and well-marinated, but the container was flimsy and leaked all over. Please invest in better packaging materials.',
      status: 'new_raw',
    },
    {
      platform: 'google',
      platformId: 'goog-rev-007',
      customerName: 'Pooja Hegde',
      rating: 3,
      reviewText: 'The non-veg options are fantastic but the vegetarian menu is quite limited. Would love to see more variety for vegetarians. Staff is friendly and the ambiance is nice.',
      status: 'new_raw',
    },

    // === POSITIVE TAMIL (3) ===
    {
      platform: 'google',
      platformId: 'goog-rev-008',
      customerName: 'முருகன் செல்வம்',
      rating: 5,
      reviewText: 'மிகவும் சுவையான உணவு! தோசை மிகவும் மெல்லியதாகவும் சுவையாகவும் இருந்தது. சாம்பார் வீட்டு சமையல் போல் இருந்தது. மீண்டும் வருவேன்.',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-006',
      customerName: 'லட்சுமி பாலா',
      rating: 4,
      reviewText: 'இங்கே ஃபில்டர் காபி மிகவும் அருமையாக இருக்கிறது. வடை மொறுமொறுப்பாக இருந்தது. விலையும் நியாயமான விலை. குடும்பத்துடன் வர மிகவும் நல்ல இடம்.',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'கார்த்திகேயன்',
      rating: 5,
      reviewText: 'சைவ தாளி சிறப்பாக இருந்தது. எல்லா உணவுகளும் சுவையாக இருந்தன. குறிப்பாக ரசம் மிகவும் நன்றாக இருந்தது. நிச்சயமாக மீண்டும் ஆர்டர் செய்வேன்.',
      status: 'new_raw',
    },

    // === NEGATIVE TAMIL (3) ===
    {
      platform: 'swiggy',
      platformId: 'swg-rev-007',
      customerName: 'செந்தில் நாதன்',
      rating: 1,
      reviewText: 'மிகவும் மோசமான அனுபவம். பிரியாணி சுவையே இல்லை, அரிசி அதிகமாக வேகவைக்கப்பட்டிருந்தது. இந்த விலைக்கு இது ஏற்றுக்கொள்ள முடியாதது.',
      status: 'new_raw',
    },
    {
      platform: 'google',
      platformId: 'goog-rev-009',
      customerName: 'மாலா கணேசன்',
      rating: 2,
      reviewText: 'டெலிவரி மிகவும் தாமதமாக வந்தது. உணவு குளிர்ந்து போயிருந்தது. பேக்கேஜிங் கிழிந்திருந்தது. மிகவும் ஏமாற்றம்.',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-007',
      customerName: 'ராஜேஷ் குமார்',
      rating: 1,
      reviewText: 'ஊழியர்கள் மிகவும் முரட்டுத்தனமாக நடந்துகொண்டார்கள். ஆர்டர் தவறாக வந்தது, புகார் செய்தபோது கவலைப்படவில்லை. மிகவும் தொழில்முறையற்ற நடத்தை.',
      status: 'new_raw',
    },

    // === TANGLISH (6) ===
    {
      platform: 'form',
      customerName: 'Vijay Kumar',
      rating: 4,
      reviewText: 'Dosa romba nalla irundhuchu! Chutney fresh ah irundhuchu. Enna na sambar konjam thanni ah irundhuchu, but overall food was very tasty. Next time definitely varuven.',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-008',
      customerName: 'Surya Prakash',
      rating: 2,
      reviewText: 'Delivery romba late ah vanthuchu da. 1.5 hours wait pannen. Food vantha apparam ellam cold ah irundhuchu. Packaging also worst. Idhu la enna quality nu theriyala.',
      status: 'new_raw',
    },
    {
      platform: 'google',
      platformId: 'goog-rev-010',
      customerName: 'Aishwarya Ravi',
      rating: 5,
      reviewText: 'Biryani taste ah sollave vendam, super ah irundhuchu! Chicken pieces also big ah irundhuchu. Price ku worth ah irundhuchu. Spice Garden is the best!',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-008',
      customerName: 'Dinesh Babu',
      rating: 1,
      reviewText: 'Yen da intha price ku intha maari food kudukkureenga? Parotta was old and hard, kurma was tasteless. Romba over rate pannirukkeenga. Waste of money.',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'Nithya Sri',
      rating: 3,
      reviewText: 'Food taste nalla irundhuchu but portion size romba kurichchu. Last month vantha po double irundhuchu. Price mattum increase aaguthu, food decrease aaguthu. Please fix this.',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-009',
      customerName: 'Ganesh Moorthy',
      rating: 4,
      reviewText: 'Filter coffee is always காப்பி super! Vada crispy ah irundhuchu. Only thing is sometimes delivery late aaguthu. But food quality is consistently good. Keep it up!',
      status: 'new_raw',
    },

    // === HINDI (4) ===
    {
      platform: 'google',
      platformId: 'goog-rev-011',
      customerName: 'अमित शर्मा',
      rating: 5,
      reviewText: 'बहुत स्वादिष्ट खाना! दोसा बहुत पतला और कुरकुरा था। नारियल की चटनी ताज़ी थी। दक्षिण भारतीय खाने के लिए यह शहर की सबसे अच्छी जगह है।',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-009',
      customerName: 'सुनीता वर्मा',
      rating: 2,
      reviewText: 'बहुत बुरा अनुभव। बिरयानी में स्वाद नहीं था और चावल बहुत ज्यादा पका हुआ था। इतनी कीमत के लिए यह बिल्कुल स्वीकार्य नहीं है। दोबारा ऑर्डर नहीं करूंगी।',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-010',
      customerName: 'Rohit Mishra',
      rating: 4,
      reviewText: 'Thali bahut achha tha! Rasam aur sambar dono ka taste kamaal ka tha. बस delivery thoda late thi, lekin food quality behtareen hai. Highly recommend karta hoon.',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'पूनम गुप्ता',
      rating: 1,
      reviewText: 'पैकेजिंग बहुत खराब थी। ग्रेवी पूरे बैग में फैल गई थी। कंटेनर के ढक्कन ढीले थे। खाना बर्बाद हो गया। कृपया अपनी पैकेजिंग सुधारें!',
      status: 'new_raw',
    },

    // === SARCASTIC (4) ===
    {
      platform: 'google',
      platformId: 'goog-rev-012',
      customerName: 'Sanjay Kapoor',
      rating: 1,
      reviewText: 'Wow, only 2 hours for delivery, amazing speed! 👏 And the food was ice cold, what a refreshing touch. Really appreciate paying premium prices for this world-class service. 10/10 would avoid.',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-010',
      customerName: 'Revathi Sundaram',
      rating: 2,
      reviewText: 'Oh what generous portions! I could barely see the chicken in my chicken biryani. I think they used a microscope to measure the meat. At least the empty container was nicely packed.',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-011',
      customerName: 'Prakash Raj',
      rating: 1,
      reviewText: 'Thank you Spice Garden for the incredible weight loss program! Portions so tiny I lost 2 kgs just from the disappointment. The price though, very generous — to your own pockets. 😂',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'Anjali Mehta',
      rating: 2,
      reviewText: 'Love how the staff makes you feel invisible! Waited 20 minutes before anyone even acknowledged my existence. But hey, at least I got plenty of time to admire the wonderful dusty decor. ✨',
      status: 'new_raw',
    },

    // === URGENT / FOOD SAFETY (4) ===
    {
      platform: 'google',
      platformId: 'goog-rev-013',
      customerName: 'Sundar Pichai',
      rating: 1,
      reviewText: 'FOUND A COCKROACH IN MY SAMBAR! This is absolutely disgusting and a serious health hazard. I have photos as evidence. I am filing a complaint with the food safety department immediately.',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-012',
      customerName: 'Rekha Balaji',
      rating: 1,
      reviewText: 'My entire family got food poisoning after eating the chicken curry last night. We spent the whole night in the hospital. My 5-year-old son was the worst affected. This is criminal negligence!',
      status: 'new_raw',
    },
    {
      platform: 'zomato',
      platformId: 'zom-rev-011',
      customerName: 'Vivek Oberoi',
      rating: 1,
      reviewText: 'Found a long strand of hair in my biryani. When I showed it to the manager, he tried to brush it off saying it might be mine. Absolutely unhygienic kitchen. Avoid this place!',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'Priyanka Das',
      rating: 1,
      reviewText: 'I had a severe allergic reaction after eating here. I specifically told them about my peanut allergy and they assured me the dish was nut-free. Ended up in the ER. They need to take allergies seriously!',
      status: 'new_raw',
    },

    // === SPAM (3) ===
    {
      platform: 'form',
      customerName: 'SpamBot2000',
      rating: null,
      reviewText: 'Buy cheap electronics at https://fake-deals.com! Best discount prices! Click here to subscribe and get 50% off! Visit www.spam-site.com for more offers! Call +919876543210',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'Marketing Guy',
      rating: null,
      reviewText: 'AAAAAAAAAAAAA BEST DEAL EVER CHECK OUT WWW.BESTDEALS.COM BUY NOW CHEAP PRICES HURRY OFFER ENDS SOON CLICK HERE SUBSCRIBE NOW DONT MISS OUT',
      status: 'new_raw',
    },
    {
      platform: 'form',
      customerName: 'Unknown',
      rating: null,
      reviewText: 'ok',
      status: 'new_raw',
    },

    // === DUPLICATES (2 — same platformId as existing reviews) ===
    {
      platform: 'google',
      platformId: 'goog-rev-001', // Duplicate of Priya Sharma's review
      customerName: 'Priya Sharma',
      rating: 5,
      reviewText: 'Absolutely loved the dosa here! The coconut chutney was fresh and the sambar had the perfect balance of spices. Best South Indian food in the city. Will definitely come back!',
      status: 'new_raw',
    },
    {
      platform: 'swiggy',
      platformId: 'swg-rev-003', // Duplicate of Neha Gupta's review
      customerName: 'Neha Gupta',
      rating: 1,
      reviewText: 'Worst experience ever. The chicken biryani was completely bland and the rice was overcooked and mushy. For the price they charge, this is unacceptable. Never ordering again.',
      status: 'new_raw',
    },
  ];

  // Clear existing reviews and tasks
  await prisma.task.deleteMany();
  await prisma.review.deleteMany();
  await prisma.insightReport.deleteMany();
  console.log('🗑️  Cleared existing data');

  // Insert all reviews
  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  console.log(`✅ Seeded ${reviews.length} reviews`);
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
