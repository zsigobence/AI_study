# AI_study

Az alkalmazás célja, hogy segítse a tanulmányi anyagok PDF formátumban történő kezelését, tárolását és elemzését. A felhasználók egyszerűen feltölthetik a jegyzeteket, tárolhatják őket az adatbázisban, és szükség esetén törölhetik is őket. Emellett lehetőség van arra is, hogy a feltöltött jegyzetek tartalmából automatikusan kérdéseket generáljanak, amelyek segíthetnek a tanulásban. A kérdések kétféle formátumban készíthetők: Igaz/Hamis típusú kérdések, valamint Rövid Válaszos kérdések.

Az alkalmazás backend része Node.js környezetben készült, amely biztosítja a dinamikus adatkezelést és a szerver oldali logikát. Az adatbázis MongoDB-t használ az adatok tárolására, így a jegyzetek és kérdések gyorsan elérhetők és rugalmasan kezelhetők. A Mongoose könyvtár segítségével történik az adatbázis-interakció.

A frontend fejlesztése során az Angular keretrendszert használtuk, amely lehetővé teszi a dinamikus és reszponzív felhasználói felület létrehozását.