import aboutImage from '../../about.png';
import type { Locale } from '../../shared/model';
import { useLanguage } from '../i18n/Language';
import { Dialog } from './Dialog';

const titles: Record<Locale, string> = {
  es: 'Acerca de Atlas Austral',
  pt: 'Sobre o Atlas Austral',
  en: 'About Atlas Austral',
};

const imageAlts: Record<Locale, string> = {
  es: 'Alén E. Geor, Agustín Caravá y Lucas G. Isla Liberatore, creadores de Atlas Austral',
  pt: 'Alén E. Geor, Agustín Caravá e Lucas G. Isla Liberatore, criadores do Atlas Austral',
  en: 'Alén E. Geor, Agustín Caravá and Lucas G. Isla Liberatore, creators of Atlas Austral',
};

function AboutCopy({ locale }: { locale: Locale }) {
  if (locale === 'pt') return <>
    <p>Desenvolvido por <strong>Alén E. Geor</strong>, <strong>Agustín Caravá</strong> e <strong>Lucas G. Isla Liberatore</strong>, estudantes do quarto ano do curso de <strong>Engenharia da Computação</strong> da <strong>Universidad Nacional de Río Negro</strong>, como trabalho final da disciplina <strong>Engenharia de Software</strong> e no âmbito da <strong>Prática de Trabalho Social (PTS)</strong>, sob a direção da <strong>Dra. Paola V. Britos</strong>, diretora do curso.</p>

    <p>Realizado em colaboração com <strong>Ezequiel Fernández</strong>, coordenador audiovisual e digital do <strong>Museo Malvinas e Islas del Atlántico Sur (Bariloche)</strong>.</p>

    <p>Esta aplicação busca contribuir para a preservação e divulgação da memória histórica da Guerra de Malvinas, aproximando seus protagonistas, acontecimentos e legado das novas gerações por meio de ferramentas tecnológicas e interativas.</p>

    <p>Dedicado à memória dos <strong>649 argentinos mortos em combate</strong> e em homenagem a <strong>todos os veteranos que retornaram à sua terra após a guerra</strong>.</p>

    <blockquote>Para aqueles que combateram com fé na alma e a celeste e branca no coração.</blockquote>

    <p className="about-honor"><strong>Glória e honra aos nossos heróis de Malvinas!</strong></p>

    <p className="about-contact">Contato: <a href="mailto:atlas.austral@gmail.com">atlas.austral@gmail.com</a></p>
  </>;

  if (locale === 'en') return <>
    <p>Developed by <strong>Alén E. Geor</strong>, <strong>Agustín Caravá</strong> and <strong>Lucas G. Isla Liberatore</strong>, fourth-year students of <strong>Computer Engineering</strong> at <strong>Universidad Nacional de Río Negro</strong>, as their final project for <strong>Software Engineering</strong> and within the framework of the <strong>Social Work Practice (PTS)</strong>, under the direction of <strong>Dra. Paola V. Britos</strong>, director of the degree program.</p>

    <p>Created in collaboration with <strong>Ezequiel Fernández</strong>, audiovisual and digital coordinator at <strong>Museo Malvinas e Islas del Atlántico Sur (Bariloche)</strong>.</p>

    <p>This application seeks to contribute to the preservation and dissemination of the historical memory of the Guerra de Malvinas, bringing its protagonists, events and legacy closer to new generations through technological and interactive tools.</p>

    <p>Dedicated to the memory of the <strong>649 Argentinians who fell in combat</strong>, and in tribute to <strong>all the veterans who returned to their homeland after the war</strong>.</p>

    <blockquote>For those who fought with faith in their souls and Argentina's light blue and white in their hearts.</blockquote>

    <p className="about-honor"><strong>Glory and honor to our heroes of Malvinas!</strong></p>

    <p className="about-contact">Contact: <a href="mailto:atlas.austral@gmail.com">atlas.austral@gmail.com</a></p>
  </>;

  return <>
    <p>Desarrollado por <strong>Alén E. Geor</strong>, <strong>Agustín Caravá</strong> y <strong>Lucas G. Isla Liberatore</strong>, estudiantes de cuarto año de la carrera de <strong>Ingeniería en Computación</strong> de la <strong>Universidad Nacional de Río Negro</strong>, como trabajo final de la asignatura <strong>Ingeniería de Software</strong> y en el marco de la <strong>Práctica de Trabajo Social (PTS)</strong>, bajo la dirección de la <strong>Dra. Paola V. Britos</strong>, directora de la carrera.</p>

    <p>Realizado en colaboración con <strong>Ezequiel Fernández</strong>, coordinador audiovisual y digital del <strong>Museo Malvinas e Islas del Atlántico Sur (Bariloche)</strong>.</p>

    <p>Esta aplicación busca contribuir a la preservación y difusión de la memoria histórica de la Guerra de Malvinas, acercando sus protagonistas, acontecimientos y legado a las nuevas generaciones mediante herramientas tecnológicas e interactivas.</p>

    <p>Dedicado a la memoria de los <strong>649 argentinos caídos en combate</strong>, y en homenaje a <strong>todos los veteranos que regresaron a su tierra tras la guerra</strong>.</p>

    <blockquote>Para quienes combatieron con la fé en el alma y la celeste y blanca en el corazón.</blockquote>

    <p className="about-honor"><strong>¡Gloria y honor a nuestros héroes de Malvinas!</strong></p>

    <p className="about-contact">Contacto: <a href="mailto:atlas.austral@gmail.com">atlas.austral@gmail.com</a></p>
  </>;
}

export function AboutDialog({ onClose }: { onClose: () => void }) {
  const { locale } = useLanguage();

  return <Dialog title={titles[locale]} onClose={onClose} wide className="about-dialog">
    <div className="about-content">
      <figure className="about-figure">
        <img src={aboutImage} alt={imageAlts[locale]} />
      </figure>
      <article className="about-copy" lang={locale}>
        <AboutCopy locale={locale} />
      </article>
    </div>
  </Dialog>;
}
