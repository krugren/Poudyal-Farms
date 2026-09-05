"use client";
import Image from 'next/image';
import ScrollReveal from '../../components/ScrollReveal';

export default function AboutPage() {
  return (
    <div className="page-about pt-nav">
      <div className="container">
        
        {/* Farm Story Section */}
        <section className="section about-story">
          <div className="grid-2 align-center">
            <ScrollReveal direction="right">
              <div className="story-content">
                <div className="section-divider"></div>
                <h1 className="section-title">Our Story</h1>
                <p>
                  Poudhyal Farms began with a simple vision: to preserve the rich agricultural 
                  heritage of Sikkim while sharing its beauty with the world. Nestled amidst the 
                  misty hills, our family-run organic farmstay offers a sanctuary from the 
                  bustle of modern life.
                </p>
                <p>
                  For three generations, we have cultivated these lands using traditional, 
                  sustainable methods. When you stay with us, you are not just a guest; you 
                  become part of our extended family and the rhythm of farm life.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="left" delay={0.2}>
              <div className="story-image-grid">
                <Image
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
                  alt="Mountains of Sikkim"
                  width={600}
                  height={400}
                  className="img-main"
                />
                <Image
                  src="https://images.unsplash.com/photo-1596706972233-a8d11d9f8260?q=80&w=2000&auto=format&fit=crop"
                  alt="Organic Farming"
                  width={400}
                  height={300}
                  className="img-sub"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Activities Section */}
        <section id="activities" className="section section--alt border-radius-lg px-8">
          <div className="text-center">
            <div className="section-divider"></div>
            <h2 className="section-title">Farm Experiences</h2>
            <p className="section-subtitle">Immerse yourself in the authentic Sikkimese way of life.</p>
          </div>

          <div className="grid-3">
            {[
              { icon: '🌿', title: 'Tea Plucking', desc: 'Join our workers in the early morning mist to pluck the finest tea leaves from our private estate.' },
              { icon: '👩‍🍳', title: 'Organic Cooking', desc: 'Learn to cook traditional Sikkimese dishes using ingredients you harvested yourself.' },
              { icon: '🚶‍♂️', title: 'Nature Walks', desc: 'Guided walks through our cardamom plantations and neighboring pristine forests.' },
              { icon: '🐦', title: 'Bird Watching', desc: 'Spot rare Himalayan bird species that visit our farm, guided by our local experts.' },
              { icon: '🔥', title: 'Bonfire Nights', desc: 'Gather around the fire with local rice beer (Tongba) and stories of the mountains.' },
              { icon: '🧘‍♀️', title: 'Yoga & Meditation', desc: 'Find your inner peace with sunrise yoga sessions overlooking the Kanchenjunga.' }
            ].map((activity, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="card activity-card text-center">
                  <div className="activity-icon">{activity.icon}</div>
                  <h3>{activity.title}</h3>
                  <p>{activity.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Travel Guide Section */}
        <section className="section travel-guide">
          <div className="text-center">
            <div className="section-divider"></div>
            <h2 className="section-title">Travel Guide</h2>
            <p className="section-subtitle">Everything you need to know to plan your journey to Poudhyal Farms.</p>
          </div>

          <div className="grid-2">
            <ScrollReveal>
              <div className="guide-card">
                <h3>✈️ How to Reach</h3>
                <ul className="guide-list">
                  <li><strong>By Air:</strong> Bagdogra Airport (IXB) is 120km away. Pakyong Airport (PYG) is closer but has limited connectivity.</li>
                  <li><strong>By Train:</strong> New Jalpaiguri (NJP) Railway Station is 115km away.</li>
                  <li><strong>By Road:</strong> We are a 4-hour scenic drive from Siliguri. We can arrange a pickup upon request.</li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="guide-card">
                <h3>☀️ Best Time to Visit</h3>
                <ul className="guide-list">
                  <li><strong>Spring (Mar-May):</strong> Blooming rhododendrons and orchids. Pleasant weather.</li>
                  <li><strong>Autumn (Sep-Nov):</strong> Clear skies, best for Kanchenjunga views and trekking.</li>
                  <li><strong>Winter (Dec-Feb):</strong> Cold and crisp. Perfect for bonfires and experiencing mountain winters.</li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>
    </div>
  );
}
