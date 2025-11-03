
package entornos.programa4.pinceles;

import java.awt.Graphics;
import java.awt.Image;
import java.awt.Point;
import javax.swing.ImageIcon;

/**
 * Pincel que dibuja una imagen con forma de estrella.
 * Carga la imagen una sola vez mediante un bloque estático.
 */
public class PincelEstrella implements Pincel{
    
    // Imagen de la estrella cargada al iniciar la clase
    private static final Image ESTRELLA;

    static{
        Image temp = null;
        try {
            temp = new ImageIcon(
                PincelEstrella.class.getResource("/entornos/programa4/imagenes/estrella.png")
            ).getImage();

        } catch (Exception e) {
            System.out.println("⚠️ No se pudo cargar la imagen de la estrella: " + e);
        }
        ESTRELLA = temp;
    }

    @Override
    public String getNombre(){
        return "Pincel estrella";
    }

    @Override
    public void dibujar(Graphics g, Point p){
        if (ESTRELLA != null) {
            // Dibuja la estrella centrada en el punto del ratón
            int ancho = ESTRELLA.getWidth(null);
            int alto = ESTRELLA.getHeight(null);
            g.drawImage(ESTRELLA, p.x-ancho/2, p.y-alto/2, null);
        }
    }

    @Override
    public void resetear() {
        // No necesita reiniciar estado
    }
    
    @Override
    public String toString(){
        return getNombre();
    }
    
}
