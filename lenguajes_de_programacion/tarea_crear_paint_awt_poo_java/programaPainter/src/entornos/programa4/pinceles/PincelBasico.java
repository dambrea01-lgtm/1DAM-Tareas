
package entornos.programa4.pinceles;

import java.awt.Graphics;
import java.awt.Point;


public class PincelBasico extends PincelCirculo{
    
    public PincelBasico(){
    
        super(1); // el pincel basico tiene radio = 1
        
    }
    
    @Override
    public String getNombre(){
        return "Pincel básico";
    }

    @Override
    public void dibujar(Graphics g, Point p){
        g.drawOval(p.x, p.y, 1, 1); // dibuja un punto
    }
    
    @Override
    public String toString(){
        return getNombre();
    }
    
}
