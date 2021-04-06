import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <a>
          <img src="logo.svg" alt="logo" />
          spacetraveling<span>.</span>
        </a>
      </div>
    </header>
  );
}
