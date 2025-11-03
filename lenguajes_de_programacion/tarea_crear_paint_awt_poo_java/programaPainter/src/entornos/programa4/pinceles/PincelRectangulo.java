
package entornos.programa4.pinceles;

import java.awt.Graphics;
import java.awt.Point;

/**
 * Pincel cuando dibuja tiene forma de rectángulo hueco.
 * Dibuja un rectángulo sin rellenar de 15x15 píxeles.
 */
public class PincelRectangulo implements Pincel{
   
    private static final int ANCHO = 15;
    private static final int ALTO = 15;

    @Override
    public String getNombre(){
        return "Pincel de pluma rectangular";
    }

    @Override
    public void dibujar(Graphics g, Point p){
        // Dibuja el rectángulo centrado en el punto del ratón
        g.drawRect(p.x-ANCHO/2, p.y-ALTO/2, ANCHO, ALTO);
    }

    @Override
    public void resetear() {
        // Este pincel no mantiene estado, no necesita reiniciarse
    }
    
    @Override
    public String toString(){
        return getNombre();
    }
}
