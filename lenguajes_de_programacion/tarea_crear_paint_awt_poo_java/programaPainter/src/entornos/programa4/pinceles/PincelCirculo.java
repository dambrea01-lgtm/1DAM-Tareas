
package entornos.programa4.pinceles;

import java.awt.Graphics;
import java.awt.Point;


public class PincelCirculo implements Pincel{
    
    private int radio;
    
    public PincelCirculo(int radio){
        this.radio = radio;
    }
    
    public int getRadio(){
        return radio;
    }
    
    @Override //indicamos que sobrescribimos
    public String getNombre(){
        return "Pincel con pluma circular de radio " + radio;
    }
    
    @Override
    public void dibujar(Graphics g, Point p){
        g.drawOval(p.x-radio, p.y-radio, 2*radio, 2*radio);
    }

    @Override
    public void resetear(){
        // No hace nada
    }
    
    @Override
    public String toString(){
        return getNombre();
    }
}
