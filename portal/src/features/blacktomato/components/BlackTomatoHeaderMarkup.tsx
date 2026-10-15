import styles from "./header.module.css";
import { TravelThemeSwitcher } from "./TravelThemeSwitcher";

export function BlackTomatoHeaderMarkup() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <a href="/" aria-label="BG Travel home" className={styles.logo}>
          <img src="/bg-travel/logo.png" alt="BG Travel" width="247" height="266" />
        </a>
        <nav aria-label="Main navigation" className={styles.actions}>
          <a href="tel:+442074269888" className={styles.phone}>
            +44 207 426 9888
          </a>
          <a
            href="https://my.blacktomato.com"
            target="_blank"
            rel="noreferrer"
            className={styles.account}
            aria-label="My account"
          >
            <img
              src="/wp-content/themes/blacktomato/img/icon-user.svg"
              alt=""
              width="18"
              height="18"
            />
          </a>
          <TravelThemeSwitcher />
          <a
            href="#journey-start"
            className={`btn btn--pink btn--inverse btn--3dless btn--rounded js-start-journey ${styles.booking}`}
            rel="nofollow"
          >
            ЗАХИАЛАХ
          </a>
        </nav>
      </div>
    </header>
  );
}
