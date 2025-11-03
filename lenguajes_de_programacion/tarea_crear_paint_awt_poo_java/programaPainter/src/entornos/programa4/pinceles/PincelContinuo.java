
package entornos.programa4.pinceles;

import java.awt.Graphics;
import java.awt.Point;
import java.util.Optional;


/**
 * Pincel que dibuja de forma continua conectando puntos.
 * Hereda de PincelBasico.
 */
public class PincelContinuo extends PincelBasico{
    
   private Optional<Point> puntoPrevio = Optional.empty();
   
   @Override
    public String getNombre(){
        return "Pincel continuo";
    }

    @Override
    public void dibujar(Graphics g, Point p){
        if (puntoPrevio.isPresent()) {
            Point prev = puntoPrevio.get();
            g.drawLine(prev.x, prev.y, p.x, p.y);
        } else {
            g.drawLine(p.x, p.y, p.x, p.y);
        }
        puntoPrevio = Optional.of(p);
    }

    @Override
    public void resetear() {
        puntoPrevio = Optional.empty();
    }
    
    @Override
    public String toString(){
        return getNombre();
    }
    
}
