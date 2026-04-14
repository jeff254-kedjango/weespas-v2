from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from models.property import Property, PropertyImage, Agent, Address, PropertyCategory
from models.property import PropertyListingType as ModelListingType
from schemas.property import (
    PropertyCreateRequest, PropertyResponse, PropertyListResponse,
    PaginatedPropertyResponse, PropertyFilterParams, PropertyUpdateRequest,
    PropertyListingType, PropertyCategory as PropertyCategoryEnum
)
import math
from typing import Optional, List, Tuple


class PropertyService:
    """
    Service layer for property operations with enterprise-level performance.
    Optimized for millions of concurrent users.
    """

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates using Haversine formula.
        Returns distance in kilometers.
        """
        R = 6371.0  # Earth's radius in km
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)

        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad

        a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

    @staticmethod
    def get_properties_paginated(
        db: Session,
        skip: int = 0,
        limit: int = 20
    ) -> PaginatedPropertyResponse:
        """
        Get all properties with pagination.
        Performance: O(log n) with proper indexing on created_at.
        """
        query = db.query(Property).filter(Property.is_active == True)
        total = query.count()

        properties = query.order_by(desc(Property.created_at)).offset(skip).limit(limit).all()
        
        items = [PropertyService._format_list_response(prop) for prop in properties]
        
        return PaginatedPropertyResponse(
            total=total,
            skip=skip,
            limit=limit,
            items=items
        )

    @staticmethod
    def create_property(
        db: Session,
        property_data: PropertyCreateRequest
    ) -> PropertyResponse:
        """
        Create a new property with address and agent association.
        Performance: Single insert with cascading relationships.
        """
        try:
            # Look up category by slug
            cat = db.query(PropertyCategory).filter(
                PropertyCategory.slug == property_data.category.value
            ).first()
            if not cat:
                raise ValueError(f"Invalid category: {property_data.category}")

            # Create address
            address = Address(
                location_name=property_data.location_name,
                latitude=property_data.latitude,
                longitude=property_data.longitude
            )

            # Create property
            db_property = Property(
                title=property_data.title,
                description=property_data.description,
                price=property_data.price,
                currency=property_data.currency,
                listing_type=property_data.listing_type,
                category_id=cat.id,
                is_engineer_certified=property_data.is_engineer_certified,
                bedrooms=property_data.bedrooms,
                bathrooms=property_data.bathrooms,
                size=property_data.size,
                size_numeric=property_data.size_numeric,
                parking_spaces=property_data.parking_spaces,
                year_built=property_data.year_built,
                agent_id=property_data.agent_id,
                address=address
            )
            
            db.add(db_property)
            db.commit()
            db.refresh(db_property)
            
            return PropertyService._format_detail_response(db_property)
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_property_by_id(db: Session, property_id: str) -> Optional[PropertyResponse]:
        """
        Get property by ID with all relationships eagerly loaded.
        Increment view count for analytics.
        """
        property_obj = db.query(Property).filter(Property.id == property_id).first()
        
        if property_obj:
            property_obj.view_count += 1
            db.commit()
            return PropertyService._format_detail_response(property_obj)
        
        return None

    @staticmethod
    def get_nearby_properties(
        db: Session,
        latitude: float,
        longitude: float,
        radius: float,
        skip: int = 0,
        limit: int = 20
    ) -> PaginatedPropertyResponse:
        """
        Get properties within a specified radius using haversine distance.
        Performance: Geo-indexed query with database-level filtering recommended for production.
        For SQLite, we do client-side filtering (acceptable for moderate datasets).
        For production: Use PostGIS with native geo-indexes.
        """
        query = db.query(Property).filter(Property.is_active == True)
        query = query.join(Address, Property.id == Address.property_id)
        
        all_properties = query.all()
        nearby_properties = []
        
        for prop in all_properties:
            distance = PropertyService.haversine_distance(
                latitude, longitude,
                prop.address.latitude, prop.address.longitude
            )
            if distance <= radius:
                nearby_properties.append((prop, distance))
        
        total = len(nearby_properties)
        nearby_properties.sort(key=lambda x: x[1])
        
        paginated = nearby_properties[skip:skip + limit]
        items = [PropertyService._format_list_response(prop, distance) for prop, distance in paginated]
        
        return PaginatedPropertyResponse(
            total=total,
            skip=skip,
            limit=limit,
            items=items
        )

    @staticmethod
    def filter_properties(
        db: Session,
        filters: PropertyFilterParams
    ) -> PaginatedPropertyResponse:
        """
        All filters optional. No filters = return all active properties.
        Any combination of filters = AND logic for hyper-refined search.
        """
        query = db.query(Property).filter(Property.is_active == True)

        # Only join Address when a location filter is actually provided
        has_location_filter = (
            filters.city is not None
            or filters.county is not None
            or filters.location_name is not None
            or (filters.latitude is not None and filters.longitude is not None and filters.radius is not None)
        )

        if has_location_filter:
            query = query.join(Address, Property.id == Address.property_id)

        # Build filters list — only add conditions for non-None values
        conditions = []

        # Listing type
        if filters.listing_type is not None:
            try:
                model_lt = ModelListingType(filters.listing_type.value)
                conditions.append(Property.listing_type == model_lt)
            except (ValueError, KeyError):
                pass

        # Category — lookup by slug, skip filter if category not found in DB
        if filters.category is not None:
            cat = db.query(PropertyCategory).filter(
                PropertyCategory.slug == filters.category.value
            ).first()
            if cat:
                conditions.append(Property.category_id == cat.id)

        # Price range
        if filters.min_price is not None:
            conditions.append(Property.price >= filters.min_price)

        if filters.max_price is not None:
            conditions.append(Property.price <= filters.max_price)

        # Engineer certified
        if filters.engineer_certified is not None:
            conditions.append(Property.is_engineer_certified == filters.engineer_certified)

        # Featured
        if filters.is_featured is not None:
            conditions.append(Property.is_featured == filters.is_featured)

        # Bedrooms (minimum)
        if filters.bedrooms is not None:
            conditions.append(Property.bedrooms >= filters.bedrooms)

        # Bathrooms (minimum)
        if filters.bathrooms is not None:
            conditions.append(Property.bathrooms >= filters.bathrooms)

        # Size range
        if filters.min_size is not None:
            conditions.append(Property.size_numeric >= filters.min_size)

        if filters.max_size is not None:
            conditions.append(Property.size_numeric <= filters.max_size)

        # Parking spaces (minimum)
        if filters.parking_spaces is not None:
            conditions.append(Property.parking_spaces >= filters.parking_spaces)

        # Text-based location (case-insensitive partial match)
        if filters.city is not None:
            conditions.append(Address.city.ilike(f"%{filters.city}%"))

        if filters.county is not None:
            conditions.append(Address.county.ilike(f"%{filters.county}%"))

        if filters.location_name is not None:
            conditions.append(Address.location_name.ilike(f"%{filters.location_name}%"))

        # Apply ALL collected conditions at once
        if conditions:
            query = query.filter(and_(*conditions))

        # Geo-spatial filtering (must happen after all SQL filters)
        use_geo = (
            filters.latitude is not None
            and filters.longitude is not None
            and filters.radius is not None
        )

        if use_geo:
            all_props = query.all()
            properties_in_radius = []
            for prop in all_props:
                if not prop.address:
                    continue
                dist = PropertyService.haversine_distance(
                    filters.latitude, filters.longitude,
                    prop.address.latitude, prop.address.longitude
                )
                if dist <= filters.radius:
                    properties_in_radius.append((prop, dist))

            total = len(properties_in_radius)

            if filters.sort_by == "distance":
                properties_in_radius.sort(key=lambda x: x[1], reverse=(filters.sort_order == "desc"))
            elif filters.sort_by == "price":
                properties_in_radius.sort(key=lambda x: float(x[0].price), reverse=(filters.sort_order == "desc"))
            else:
                properties_in_radius.sort(key=lambda x: x[0].created_at, reverse=(filters.sort_order == "desc"))

            paginated = properties_in_radius[filters.skip:filters.skip + filters.limit]
            items = [PropertyService._format_list_response(prop, dist) for prop, dist in paginated]
        else:
            # Standard sorting (no geo)
            if filters.sort_by == "price":
                sort_col = desc(Property.price) if filters.sort_order == "desc" else asc(Property.price)
            elif filters.sort_by == "distance":
                sort_col = desc(Property.created_at)
            else:
                sort_col = desc(Property.created_at) if filters.sort_order == "desc" else asc(Property.created_at)

            total = query.count()
            properties = query.order_by(sort_col).offset(filters.skip).limit(filters.limit).all()
            items = [PropertyService._format_list_response(prop) for prop in properties]

        return PaginatedPropertyResponse(
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            items=items
        )

    @staticmethod
    def update_property(
        db: Session,
        property_id: str,
        update_data: PropertyUpdateRequest
    ) -> Optional[PropertyResponse]:
        """
        Update property fields selectively.
        Only updates non-null fields.
        """
        property_obj = db.query(Property).filter(Property.id == property_id).first()
        
        if not property_obj:
            return None
        
        update_fields = update_data.dict(exclude_unset=True)
        
        for field, value in update_fields.items():
            if value is not None and hasattr(property_obj, field):
                setattr(property_obj, field, value)
        
        db.commit()
        db.refresh(property_obj)
        
        return PropertyService._format_detail_response(property_obj)

    @staticmethod
    def delete_property(db: Session, property_id: str) -> bool:
        """
        Soft delete: Mark property as inactive.
        For hard delete: Use property_obj.delete() which cascades.
        """
        property_obj = db.query(Property).filter(Property.id == property_id).first()
        
        if not property_obj:
            return False
        
        property_obj.is_active = False
        db.commit()
        
        return True

    @staticmethod
    def search_properties(
        db: Session,
        query_string: str,
        skip: int = 0,
        limit: int = 20
    ) -> PaginatedPropertyResponse:
        """
        Full-text search on property title and description.
        Performance: Indexed on title for production use.
        For production: Use PostgreSQL full-text search or Elasticsearch.
        """
        query = db.query(Property).filter(Property.is_active == True)
        
        search_filter = or_(
            Property.title.ilike(f"%{query_string}%"),
            Property.description.ilike(f"%{query_string}%")
        )
        
        query = query.filter(search_filter)
        total = query.count()
        
        properties = query.order_by(desc(Property.created_at)).offset(skip).limit(limit).all()
        
        items = [PropertyService._format_list_response(prop) for prop in properties]
        
        return PaginatedPropertyResponse(
            total=total,
            skip=skip,
            limit=limit,
            items=items
        )

    @staticmethod
    def get_featured_properties(
        db: Session,
        limit: int = 10
    ) -> List[PropertyListResponse]:
        """
        Get featured properties (admin-promoted listings).
        Performance: Indexed on is_featured and created_at.
        """
        properties = db.query(Property).filter(
            and_(
                Property.is_featured == True,
                Property.is_active == True
            )
        ).order_by(desc(Property.created_at)).limit(limit).all()
        
        return [PropertyService._format_list_response(prop) for prop in properties]

    @staticmethod
    def _format_detail_response(property_obj: Property) -> PropertyResponse:
        """
        Format property object for detailed response with all relationships.
        Performance: Assumes relationships are already loaded (eager loading).
        """
        agent_data = None
        if property_obj.agent:
            agent_data = {
                "id": property_obj.agent.id,
                "agent_name": property_obj.agent.agent_name,
                "agent_phone_number": property_obj.agent.agent_phone_number,
                "agent_profile_picture": property_obj.agent.agent_profile_picture,
                "email": property_obj.agent.email,
                "bio": property_obj.agent.bio,
                "is_verified": property_obj.agent.is_verified,
                "is_active": property_obj.agent.is_active,
                "created_at": property_obj.agent.created_at,
                "updated_at": property_obj.agent.updated_at
            }
        
        address_data = None
        if property_obj.address:
            address_data = {
                "id": property_obj.address.id,
                "location_name": property_obj.address.location_name,
                "street_address": property_obj.address.street_address,
                "city": property_obj.address.city,
                "county": property_obj.address.county,
                "postal_code": property_obj.address.postal_code,
                "country": property_obj.address.country,
                "latitude": property_obj.address.latitude,
                "longitude": property_obj.address.longitude,
                "created_at": property_obj.address.created_at,
                "updated_at": property_obj.address.updated_at
            }
        
        images_data = [
            {
                "id": img.id,
                "url": img.url,
                "thumbnail_url": img.thumbnail_url,
                "alt_text": img.alt_text,
                "order": img.order,
                "is_main": img.is_main,
                "file_size": img.file_size,
                "mime_type": img.mime_type,
                "created_at": img.created_at
            } for img in property_obj.images
        ]
        
        videos_data = [
            {
                "id": vid.id,
                "url": vid.url,
                "thumbnail_url": vid.thumbnail_url,
                "streaming_url": vid.streaming_url,
                "title": vid.title,
                "description": vid.description,
                "duration": vid.duration,
                "order": vid.order,
                "file_size": vid.file_size,
                "mime_type": vid.mime_type,
                "created_at": vid.created_at
            } for vid in property_obj.videos
        ]
        
        return PropertyResponse(
            id=property_obj.id,
            title=property_obj.title,
            description=property_obj.description,
            price=float(property_obj.price),
            currency=property_obj.currency,
            listing_type=property_obj.listing_type.value,
            category=property_obj.category.slug if property_obj.category else property_obj.category_id,
            is_engineer_certified=property_obj.is_engineer_certified,
            bedrooms=property_obj.bedrooms,
            bathrooms=property_obj.bathrooms,
            size=property_obj.size,
            size_numeric=property_obj.size_numeric,
            parking_spaces=property_obj.parking_spaces,
            year_built=property_obj.year_built,
            address=address_data,
            agent=agent_data,
            images=images_data,
            videos=videos_data,
            is_active=property_obj.is_active,
            is_featured=property_obj.is_featured,
            view_count=property_obj.view_count,
            created_at=property_obj.created_at,
            updated_at=property_obj.updated_at,
            expires_at=property_obj.expires_at
        )

    @staticmethod
    def _format_list_response(property_obj: Property, distance: Optional[float] = None) -> PropertyListResponse:
        """
        Format property object for list response (lightweight).
        Performance: Minimal data transfer for pagination.
        """
        main_image = None
        if property_obj.images:
            main = next((img for img in property_obj.images if img.is_main), None)
            if not main and property_obj.images:
                main = property_obj.images[0]
            
            if main:
                main_image = {
                    "id": main.id,
                    "url": main.url,
                    "thumbnail_url": main.thumbnail_url,
                    "alt_text": main.alt_text,
                    "order": main.order,
                    "is_main": main.is_main,
                    "file_size": main.file_size,
                    "mime_type": main.mime_type,
                    "created_at": main.created_at
                }
        
        return PropertyListResponse(
            id=property_obj.id,
            title=property_obj.title,
            price=float(property_obj.price),
            currency=property_obj.currency,
            listing_type=property_obj.listing_type.value,
            category=property_obj.category.slug if property_obj.category else property_obj.category_id,
            is_engineer_certified=property_obj.is_engineer_certified,
            location_name=property_obj.address.location_name if property_obj.address else "Unknown",
            latitude=property_obj.address.latitude if property_obj.address else 0,
            longitude=property_obj.address.longitude if property_obj.address else 0,
            agent_name=property_obj.agent.agent_name if property_obj.agent else None,
            main_image=main_image,
            is_featured=property_obj.is_featured,
            view_count=property_obj.view_count,
            created_at=property_obj.created_at,
            distance=distance,
            bedrooms=property_obj.bedrooms,
            bathrooms=property_obj.bathrooms
        )