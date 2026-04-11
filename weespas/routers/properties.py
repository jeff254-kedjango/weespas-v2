from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.orm import Session
from core.database import get_db
from services.property_service import PropertyService
from schemas.property import (
    PropertyCreateRequest, PropertyResponse, PropertyListResponse,
    PaginatedPropertyResponse, PropertyFilterParams, PropertyUpdateRequest
)

router = APIRouter()


# ===================== PROPERTY LIST =====================

@router.get(
    "/properties",
    response_model=PaginatedPropertyResponse,
    summary="List all active properties",
    tags=["Properties"]
)
def list_properties(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records per page"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all active properties with pagination.

    **Performance**: O(log n) with created_at index.
    """
    return PropertyService.get_properties_paginated(db, skip=skip, limit=limit)


# ===================== SEARCH & FILTERING =====================
# These MUST be defined before /properties/{property_id} to avoid route conflicts

@router.get(
    "/properties/search/query",
    response_model=PaginatedPropertyResponse,
    summary="Search properties by keyword",
    tags=["Search"]
)
def search_properties(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Full-text search on property title and description.

    **Performance**: Indexed on title for optimal performance.
    """
    return PropertyService.search_properties(db, q, skip=skip, limit=limit)


@router.get(
    "/properties/nearby",
    response_model=PaginatedPropertyResponse,
    summary="Find nearby properties",
    tags=["Search"]
)
def get_nearby_properties(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius: float = Query(10, gt=0, description="Radius in kilometers"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Find all properties within a specified radius of coordinates.

    **Default radius**: 10km
    """
    return PropertyService.get_nearby_properties(
        db, latitude, longitude, radius,
        skip=skip, limit=limit
    )


@router.get(
    "/properties/featured",
    response_model=list[PropertyListResponse],
    summary="Get featured properties",
    tags=["Special"]
)
def get_featured_properties(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get admin-promoted featured properties.

    **Use case**: Homepage hero section, top listings.
    """
    return PropertyService.get_featured_properties(db, limit=limit)


@router.post(
    "/properties/filter",
    response_model=PaginatedPropertyResponse,
    summary="Advanced property filtering",
    tags=["Search"]
)
def filter_properties(
    filters: PropertyFilterParams = Body(...),
    db: Session = Depends(get_db)
):
    """
    Advanced filtering with multiple criteria:

    - **Location-based**: latitude, longitude, radius (in km)
    - **Price**: min_price, max_price
    - **Category**: specific property type
    - **Listing type**: rent or sale
    - **Attributes**: engineer_certified, bedrooms
    - **Sorting**: by created_at, price, or distance

    **Performance**: Uses composite indexes for optimal query performance.
    """
    return PropertyService.filter_properties(db, filters)


# ===================== PROPERTY DETAIL (must come AFTER specific paths) =====================

@router.get(
    "/properties/{property_id}",
    response_model=PropertyResponse,
    summary="Get property details",
    tags=["Properties"]
)
def get_property(
    property_id: str = Path(..., description="Property UUID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve detailed information for a specific property.

    **Tracking**: View count is incremented.
    """
    property_obj = PropertyService.get_property_by_id(db, property_id)
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    return property_obj


# ===================== PROPERTY CREATION & MANAGEMENT =====================

@router.post(
    "/properties",
    response_model=PropertyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new property",
    tags=["Properties"]
)
def create_property(
    property_data: PropertyCreateRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Create a new property listing.

    **Required fields**: title, description, price, listing_type, category, location_name, latitude, longitude

    **Performance**: Single database insert with cascading relationships.
    """
    try:
        return PropertyService.create_property(db, property_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create property: {str(e)}"
        )


@router.put(
    "/properties/{property_id}",
    response_model=PropertyResponse,
    summary="Update property",
    tags=["Properties"]
)
def update_property(
    property_id: str,
    update_data: PropertyUpdateRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Update specific property fields.

    **Note**: Only fields provided in the request are updated.
    """
    result = PropertyService.update_property(db, property_id, update_data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    return result


@router.delete(
    "/properties/{property_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete property",
    tags=["Properties"]
)
def delete_property(
    property_id: str,
    db: Session = Depends(get_db)
):
    """
    Soft delete a property (marks as inactive).
    """
    if not PropertyService.delete_property(db, property_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
