DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS heroes;
CREATE TABLE heroes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    power VARCHAR(50) NOT NULL,
    heroStatus VARCHAR(20) NOT NULL DEFAULT 'available',
    
    CONSTRAINT chk_power CHECK (power IN ('flight', 'strength', 'telepathy', 'speed', 'invisibility')),
    CONSTRAINT chk_hero_status CHECK (heroStatus IN ('available', 'busy'))
);
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    
    hero_id INTEGER REFERENCES heroes(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_level CHECK (level IN ('low', 'medium', 'critical')),
    CONSTRAINT chk_incident_status CHECK (status IN ('open', 'assigned', 'resolved'))
);
