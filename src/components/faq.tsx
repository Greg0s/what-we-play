import "../stylesheets/faq.scss";
import { useTranslation } from "../i18n";

/**
 * Only the landing pages carry this. Repeating the same four answers on all 33
 * pages would be duplicate content, and this is where a "what is this site"
 * question lands anyway.
 */
export function Faq() {
  const { t } = useTranslation();

  return (
    <section className="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">{t.content.faqTitle}</h2>
      <dl>
        {t.content.faq.map(({ question, answer }) => (
          <div key={question}>
            <dt>{question}</dt>
            <dd>{answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
