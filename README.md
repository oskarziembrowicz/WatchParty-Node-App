# WatchParty – aplikacja Node.js

Aplikacja REST API do organizowania wspólnych seansów filmowych, zbudowana w oparciu o Node.js, Express i MongoDB.

---

## Wymagania wstępne

Przed przystąpieniem do instalacji upewnij się, że masz zainstalowane poniższe narzędzia.

### 1. Node.js 22+ i npm

Sprawdź, czy Node.js jest zainstalowany:

```bash
node -v
npm -v
```

Jeśli nie – pobierz instalator ze strony [https://nodejs.org](https://nodejs.org) (zalecana wersja LTS ≥ 22).

Linux (via nvm – zalecane):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22
```

macOS (Homebrew):

```bash
brew install node
```

Windows: pobierz instalator ze strony [https://nodejs.org](https://nodejs.org).

### 2. nodemon (opcjonalnie, do trybu deweloperskiego)

Aplikacja uruchamia się przez `nodemon`. Zainstaluj go globalnie:

```bash
npm install -g nodemon
```

Jeśli nie chcesz instalować nodemon globalnie, możesz uruchomić aplikację przez `node server.js` – patrz sekcja [Uruchomienie aplikacji](#uruchomienie-aplikacji).

### 3. MongoDB Atlas (chmurowa baza danych)

Aplikacja korzysta z bazy danych MongoDB hostowanej w chmurze (MongoDB Atlas). Nie musisz instalować MongoDB lokalnie – wystarczy konto na Atlas i connection string.

1. Utwórz bezpłatne konto na [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Utwórz nowy klaster (opcja **Free Shared** jest wystarczająca).
3. Utwórz użytkownika bazy danych (zakładka **Database Access**) z hasłem.
4. Zezwól na połączenia z Twojego adresu IP (zakładka **Network Access** → **Add IP Address** → **Allow Access from Anywhere** dla środowiska deweloperskiego).
5. Skopiuj connection string (zakładka **Connect** → **Connect your application**). Będzie wyglądał podobnie do:
   ```
   mongodb+srv://<użytkownik>:<hasło>@cluster0.xxxxx.mongodb.net/watch-party?retryWrites=true
   ```

### 4. Klucze API

Aplikacja korzysta z zewnętrznego API do pobierania informacji o filmach:

- **OMDb API** – utwórz bezpłatne konto na [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx), aby uzyskać klucz API.

---

## Pobranie projektu

Sklonuj repozytorium za pomocą Git:

```bash
git clone https://github.com/oskarziembrowicz/masters-degree-project.git
cd masters-degree-project/WatchParty-Node-App
```

Jeśli Git nie jest zainstalowany:

- **Ubuntu/Debian:** `sudo apt install git`
- **macOS:** `brew install git`
- **Windows:** pobierz z [https://git-scm.com/download/win](https://git-scm.com/download/win)

---

## Konfiguracja pliku `.env`

Utwórz plik `.env` w katalogu `WatchParty-Node-App`:

```bash
cp .env.example .env
```

Otwórz plik `.env` i uzupełnij go swoimi danymi:

```env
PORT=3000

# Wklej connection string z MongoDB Atlas (z wpisanym hasłem)
DATABASE=mongodb+srv://<użytkownik>:<hasło>@cluster0.xxxxx.mongodb.net/watch-party?retryWrites=true

# Klucz tajny do podpisywania tokenów JWT – wpisz dowolny długi losowy ciąg znaków
JWT_SECRET=tu_wpisz_dllugi_losowy_klucz_jwt
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Klucz API
OMDB_API_KEY=twój_klucz_omdb_api

# Środowisko wykonawcze: development lub production
NODE_ENV=development
```

Zastąp `<użytkownik>` i `<hasło>` danymi użytkownika utworzonego w MongoDB Atlas.

---

## Instalacja zależności

```bash
npm install
```

---

## Uruchomienie aplikacji

### Tryb deweloperski (z automatycznym restartem po zmianach)

```bash
npm start
```

Wymaga zainstalowanego `nodemon`. Uruchomienie odpowiada poleceniu `nodemon server.js`.

### Alternatywnie – bez nodemon

```bash
node server.js
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

---

## Podsumowanie – kolejność kroków

1. Zainstaluj Node.js 22+ i npm
2. Zainstaluj nodemon globalnie (`npm install -g nodemon`) – opcjonalnie
3. Utwórz konto na MongoDB Atlas i skonfiguruj klaster
4. Utwórz konta i pobierz klucze API (Trakt, OMDb)
5. Sklonuj repozytorium
6. Przejdź do katalogu `WatchParty-Node-App`
7. Skopiuj `config backup.env` do `.env` i uzupełnij wszystkie wartości
8. Uruchom `npm install`
9. Uruchom `npm start` (lub `node server.js`)
