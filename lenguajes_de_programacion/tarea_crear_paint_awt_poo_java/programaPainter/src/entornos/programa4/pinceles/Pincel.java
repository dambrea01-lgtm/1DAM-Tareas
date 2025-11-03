
package entornos.programa4.pinceles;

import java.awt.Graphics;
import java.awt.Point;

/**
 * Interfaz que representa un pincel genérico para el programa de dibujo.
 * Todos los pinceles implementarán estos métodos para poder dibujar en el lienzo.
 */
public interface Pincel{
    
    /**
     * Devuelve el nombre del pincel.
     * @return Nombre descriptivo del pincel
     */
    String getNombre();
    
    /**
     * Dibuja una marca en el lienzo usando el objeto Graphics.
     * @param g Objeto Graphics donde se realizará el dibujo
     * @param p Punto donde se dibujará la marca
     */
    void dibujar(Graphics g, Point p);
    
    /**
     * Reinicia el estado interno del pincel.
     * Útil para pinceles que necesitan recordar información, 
     * como el PincelContinuo.
     */
    void resetear();
}
