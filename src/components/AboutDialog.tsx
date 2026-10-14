import aboutImage from '../../about.png';
import { Dialog } from './Dialog';

export function AboutDialog({ onClose }: { onClose: () => void }) {
  return <Dialog title="Acerca de Atlas Austral" onClose={onClose} wide className="about-dialog">
    <div className="about-content">
      <figure className="about-figure">
        <img src={aboutImage} alt="Agustín Caravá, Lucas G. Isla Liberatore y Alén E. Geor, creadores de Atlas Austral" />
      </figure>
      <article className="about-copy">
        <p>Desarrollado por <strong>Agustín Caravá</strong>, <strong>Lucas G. Isla Liberatore</strong> y <strong>Alén E. Geor</strong>, estudiantes de cuarto año de la carrera de <strong>Ingeniería en Computación</strong> de la <strong>Universidad Nacional de Río Negro</strong>, como trabajo final de la asignatura <strong>Ingeniería de Software</strong> y en el marco de la <strong>Práctica de Trabajo Social (PTS)</strong>, bajo la dirección de la <strong>Dra. Paola V. Britos</strong>, directora de la carrera.</p>

        <p>Realizado en colaboración con <strong>Ezequiel Fernández</strong>, coordinador audiovisual y digital del <strong>Museo Malvinas Bariloche</strong>.</p>

        <p>Esta aplicación busca contribuir a la preservación y difusión de la memoria histórica de la Guerra de Malvinas, acercando sus protagonistas, acontecimientos y legado a las nuevas generaciones mediante herramientas tecnológicas e interactivas.</p>

        <p>Dedicado a la memoria de los <strong>649 argentinos caídos en combate</strong>, y en homenaje a <strong>todos los veteranos que regresaron a su tierra tras la guerra</strong>.</p>

        <blockquote>Para quienes combatieron con la fé en el alma y la celeste y blanca en el corazón.</blockquote>

        <p className="about-honor"><strong>¡Gloria y honor a nuestros héroes de Malvinas!</strong></p>

        <p className="about-contact">Contacto: <a href="mailto:atlas.austral@gmail.com">atlas.austral@gmail.com</a></p>
      </article>
    </div>
  </Dialog>;
}
