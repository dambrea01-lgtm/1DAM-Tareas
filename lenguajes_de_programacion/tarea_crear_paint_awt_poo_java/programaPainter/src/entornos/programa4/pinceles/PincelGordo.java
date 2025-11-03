
package entornos.programa4.pinceles;

import java.awt.Graphics;
import java.awt.Point;


public class PincelGordo extends PincelCirculo{
    
    public PincelGordo(){
    
        super(20); //radio es 20
    }
    
    @Override
    public String getNombre(){
        return "Pincel gordo";
    }

    @Override
    public void dibujar(Graphics g, Point p){
        int diametro = 2 * 20; // radio fijo = 20
        g.fillOval(p.x - 20, p.y - 20, diametro, diametro);
    }
    
    @Override
    public String toString(){
        return getNombre();
    }
    
}
