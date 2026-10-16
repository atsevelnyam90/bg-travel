import { BlackTomatoHeroButton } from "./BlackTomatoHeroButton";
import { BlackTomatoHeroCopy } from "./BlackTomatoHeroCopy";

export function BlackTomatoHeroSectionMarkup() {
  return (
<section className="section section--hero-banner section--hero-banner--single_image section--hero-banner--full section--hero-banner--video section--hero-banner--" id="">
            
                <div className="banner__video hidden-lg">            
                        <video className="video inline" width="100%" autoPlay={true} loop={true} muted={true} playsInline={true} poster="/bg-travel/poster.jpg" data-object-fit="cover" preload="metadata">
                <source src="/bg-travel/background.mp4" type="video/mp4" />
            </video>
                      </div>
          <div className="banner__video visible-lg">            
                        <video className="video inline" width="100%" autoPlay={true} loop={true} muted={true} playsInline={true} poster="/bg-travel/poster.jpg" data-object-fit="cover" preload="metadata">
                <source src="/bg-travel/background.mp4" type="video/mp4" />
            </video>
                      </div>
      
      
  

  <div className="container container--absolute">
    <div style={{ textAlign: 'center' }}>
<BlackTomatoHeroCopy />
<div className="text--white" style={{ justifyContent: 'center', display: 'flex', gap: '16px' }}><BlackTomatoHeroButton /></div>
</div>

    
  </div>

      <div className="section__scroll section__scroll--white">
        <a href="#journey-start" className="js-scroll-page-down">
            <span>Scroll</span>
        </a>
        <span className="section__scroll__line"></span>
    </div>
    
</section>
  );
}
