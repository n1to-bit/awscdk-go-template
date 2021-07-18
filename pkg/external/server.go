package external

import (
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	"github.com/nito95/awscdk-go-template/pkg/external/postgres"
	"github.com/nito95/awscdk-go-template/pkg/handlers"
	"gopkg.in/go-playground/validator.v9"
)

var Server server

type server struct {
	e   *echo.Echo
	cfg *config
}

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

type Error struct {
	Error string `json:"error"`
}

func init() {
	cfg := loadConfig()
	e := echo.New()
	e.HideBanner = true
	e.Logger.SetLevel(log.INFO)
	e.Validator = &CustomValidator{validator: validator.New()}

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(postgres.ClientBuilder(cfg.DatabaseURL))

	Server.e = e
	Server.cfg = cfg
}

func (s *server) Run() {
	s.e.GET("/health_check", handlers.HealthCheck.Show)

	s.e.Logger.Fatal(s.e.Start(s.cfg.Addr))
}

type config struct {
	Addr        string
	DatabaseURL string
}

func loadConfig() *config {
	addr := os.Getenv("ADDR")
	if addr == "" {
		panic("ADDR is required.")
	}
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		panic("DATABASE_URL is required.")
	}

	return &config{
		Addr:        addr,
		DatabaseURL: databaseURL,
	}
}
