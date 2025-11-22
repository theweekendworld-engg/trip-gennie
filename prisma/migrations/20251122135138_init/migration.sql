-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "short_summary" TEXT NOT NULL,
    "ai_enhanced_summary" TEXT,
    "best_months" VARCHAR(100),
    "image_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_destinations" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "distance_km" INTEGER NOT NULL,
    "travel_time_minutes" INTEGER NOT NULL,
    "transport_mode" VARCHAR(20) NOT NULL,
    "estimated_fuel_cost" INTEGER,
    "estimated_transport_cost" INTEGER,
    "route_quality" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nearby_attractions" (
    "id" SERIAL NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "distance_km" INTEGER NOT NULL,
    "category" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nearby_attractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fingerprint_hash" VARCHAR(64) NOT NULL,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_searches" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" BIGSERIAL NOT NULL,
    "session_id" UUID,
    "city_id" INTEGER,
    "filters" JSONB,
    "result_count" INTEGER,
    "searched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_pages" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "city_id" INTEGER,
    "page_type" VARCHAR(50) NOT NULL,
    "meta_title" VARCHAR(200) NOT NULL,
    "meta_description" TEXT NOT NULL,
    "ai_intro_paragraph" TEXT,
    "ai_faq_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "endpoint" VARCHAR(100) NOT NULL,
    "request_count" INTEGER NOT NULL DEFAULT 1,
    "window_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_cache" (
    "id" SERIAL NOT NULL,
    "api_name" VARCHAR(50) NOT NULL,
    "cache_key" VARCHAR(500) NOT NULL,
    "request_params" JSONB NOT NULL,
    "response_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "last_validated" TIMESTAMP(3),

    CONSTRAINT "api_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_photos" (
    "id" SERIAL NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "photo_reference" VARCHAR(500) NOT NULL,
    "photo_url" VARCHAR(500),
    "width" INTEGER,
    "height" INTEGER,
    "attribution" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distance_matrix_cache" (
    "id" SERIAL NOT NULL,
    "origin_lat" DECIMAL(10,8) NOT NULL,
    "origin_lng" DECIMAL(11,8) NOT NULL,
    "destination_lat" DECIMAL(10,8) NOT NULL,
    "destination_lng" DECIMAL(11,8) NOT NULL,
    "transport_mode" VARCHAR(20) NOT NULL,
    "distance_meters" INTEGER NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "distance_text" VARCHAR(50),
    "duration_text" VARCHAR(50),
    "route_polyline" TEXT,
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distance_matrix_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places_cache" (
    "id" SERIAL NOT NULL,
    "place_id" VARCHAR(200) NOT NULL,
    "name" VARCHAR(200),
    "formatted_address" TEXT,
    "rating" DECIMAL(2,1),
    "user_ratings_total" INTEGER,
    "types" JSONB,
    "opening_hours" JSONB,
    "website" VARCHAR(500),
    "phone_number" VARCHAR(50),
    "reviews" JSONB,
    "full_response" JSONB NOT NULL,
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "places_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_slug_idx" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_is_active_idx" ON "cities"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "destinations_slug_idx" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "destinations_category_idx" ON "destinations"("category");

-- CreateIndex
CREATE INDEX "destinations_is_active_idx" ON "destinations"("is_active");

-- CreateIndex
CREATE INDEX "city_destinations_city_id_idx" ON "city_destinations"("city_id");

-- CreateIndex
CREATE INDEX "city_destinations_destination_id_idx" ON "city_destinations"("destination_id");

-- CreateIndex
CREATE INDEX "city_destinations_distance_km_idx" ON "city_destinations"("distance_km");

-- CreateIndex
CREATE INDEX "city_destinations_travel_time_minutes_idx" ON "city_destinations"("travel_time_minutes");

-- CreateIndex
CREATE INDEX "city_destinations_transport_mode_idx" ON "city_destinations"("transport_mode");

-- CreateIndex
CREATE UNIQUE INDEX "city_destinations_city_id_destination_id_transport_mode_key" ON "city_destinations"("city_id", "destination_id", "transport_mode");

-- CreateIndex
CREATE INDEX "nearby_attractions_destination_id_idx" ON "nearby_attractions"("destination_id");

-- CreateIndex
CREATE INDEX "user_sessions_fingerprint_hash_idx" ON "user_sessions"("fingerprint_hash");

-- CreateIndex
CREATE INDEX "user_sessions_last_seen_idx" ON "user_sessions"("last_seen");

-- CreateIndex
CREATE INDEX "search_logs_session_id_idx" ON "search_logs"("session_id");

-- CreateIndex
CREATE INDEX "search_logs_city_id_idx" ON "search_logs"("city_id");

-- CreateIndex
CREATE INDEX "search_logs_searched_at_idx" ON "search_logs"("searched_at");

-- CreateIndex
CREATE UNIQUE INDEX "seo_pages_slug_key" ON "seo_pages"("slug");

-- CreateIndex
CREATE INDEX "seo_pages_slug_idx" ON "seo_pages"("slug");

-- CreateIndex
CREATE INDEX "seo_pages_city_id_idx" ON "seo_pages"("city_id");

-- CreateIndex
CREATE INDEX "seo_pages_page_type_idx" ON "seo_pages"("page_type");

-- CreateIndex
CREATE INDEX "rate_limits_identifier_endpoint_idx" ON "rate_limits"("identifier", "endpoint");

-- CreateIndex
CREATE INDEX "rate_limits_window_start_idx" ON "rate_limits"("window_start");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_identifier_endpoint_window_start_key" ON "rate_limits"("identifier", "endpoint", "window_start");

-- CreateIndex
CREATE INDEX "api_cache_api_name_cache_key_idx" ON "api_cache"("api_name", "cache_key");

-- CreateIndex
CREATE INDEX "api_cache_expires_at_idx" ON "api_cache"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_cache_api_name_cache_key_key" ON "api_cache"("api_name", "cache_key");

-- CreateIndex
CREATE INDEX "destination_photos_destination_id_idx" ON "destination_photos"("destination_id");

-- CreateIndex
CREATE INDEX "destination_photos_destination_id_is_primary_idx" ON "destination_photos"("destination_id", "is_primary");

-- CreateIndex
CREATE INDEX "distance_matrix_cache_origin_lat_origin_lng_idx" ON "distance_matrix_cache"("origin_lat", "origin_lng");

-- CreateIndex
CREATE INDEX "distance_matrix_cache_destination_lat_destination_lng_idx" ON "distance_matrix_cache"("destination_lat", "destination_lng");

-- CreateIndex
CREATE UNIQUE INDEX "distance_matrix_cache_origin_lat_origin_lng_destination_lat_key" ON "distance_matrix_cache"("origin_lat", "origin_lng", "destination_lat", "destination_lng", "transport_mode");

-- CreateIndex
CREATE UNIQUE INDEX "places_cache_place_id_key" ON "places_cache"("place_id");

-- CreateIndex
CREATE INDEX "places_cache_place_id_idx" ON "places_cache"("place_id");

-- AddForeignKey
ALTER TABLE "city_destinations" ADD CONSTRAINT "city_destinations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_destinations" ADD CONSTRAINT "city_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearby_attractions" ADD CONSTRAINT "nearby_attractions_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_pages" ADD CONSTRAINT "seo_pages_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_photos" ADD CONSTRAINT "destination_photos_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
