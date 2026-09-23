export default function PageHero({
  label,
  title,
  subtitle,
  bgImage,
  bgPosition = 'center 40%',
  titleId,
  ariaLabelledby,
  className = '',
}) {
  return (
    <section
      className={`page-hero ${className}`.trim()}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: bgPosition,
      }}
      aria-labelledby={ariaLabelledby || titleId}
    >
      <div className="page-hero-overlay" />
      <div className="page-hero-inner">
        {label && <p className="page-hero-label">{label}</p>}
        <h1 className="page-hero-title" id={titleId}>
          {title}
        </h1>
        {subtitle && <p className="page-hero-sub">{subtitle}</p>}
      </div>
    </section>
  )
}
