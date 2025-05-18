import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AgeGroup, HealthCondition, MealPlan, useFormContext } from "@/contexts/FormContext";
import { Plus, Trash2, Edit, Calendar, ChefHat, Utensils, Clock, Info, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { healthConditionsList } from "@shared/schema";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { nanoid } from "nanoid";

export default function MealPlanner() {
  const { 
    mealPlans, 
    addMealPlan, 
    removeMealPlan, 
    updateMealPlan,
    userProfile,
    activeChildId
  } = useFormContext();
  
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  
  // Meal plan creation form state
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planAgeGroup, setPlanAgeGroup] = useState<AgeGroup>("0-2");
  const [planConditions, setPlanConditions] = useState<HealthCondition[]>([]);
  const [meals, setMeals] = useState<MealPlan["meals"]>([
    { time: "8:00", name: "Breakfast", description: "" },
    { time: "12:00", name: "Lunch", description: "" },
    { time: "18:00", name: "Dinner", description: "" }
  ]);
  
  // Get active child's health conditions
  const activeChild = userProfile?.children.find(child => child.id === activeChildId);
  
  const handleAddMeal = () => {
    setMeals([...meals, { time: "", name: "", description: "" }]);
  };
  
  const handleMealChange = (index: number, field: keyof MealPlan["meals"][0], value: string) => {
    const updatedMeals = [...meals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setMeals(updatedMeals);
  };
  
  const handleRemoveMeal = (index: number) => {
    const updatedMeals = [...meals];
    updatedMeals.splice(index, 1);
    setMeals(updatedMeals);
  };
  
  const toggleCondition = (condition: { id: string; name: string }) => {
    const exists = planConditions.some(c => c.id === condition.id);
    
    if (exists) {
      setPlanConditions(planConditions.filter(c => c.id !== condition.id));
    } else {
      setPlanConditions([...planConditions, condition]);
    }
  };
  
  const handleCreateMealPlan = () => {
    if (!planName.trim()) return;
    
    const newPlan: MealPlan = {
      id: nanoid(),
      name: planName.trim(),
      description: planDescription.trim(),
      meals: meals.filter(meal => meal.name.trim() && meal.time.trim()), // Filter out empty meals
      targetAgeGroup: planAgeGroup,
      healthConditions: planConditions,
      createdAt: Date.now()
    };
    
    addMealPlan(newPlan);
    
    // Reset form
    setPlanName("");
    setPlanDescription("");
    setPlanAgeGroup("0-2");
    setPlanConditions([]);
    setMeals([
      { time: "8:00", name: "Breakfast", description: "" },
      { time: "12:00", name: "Lunch", description: "" },
      { time: "18:00", name: "Dinner", description: "" }
    ]);
    setIsAddingPlan(false);
  };
  
  const handleUpdateMealPlan = (plan: MealPlan) => {
    updateMealPlan(plan);
    setEditingPlanId(null);
  };
  
  // Initialize form with active child data if available
  const loadActiveChildData = () => {
    if (activeChild) {
      setPlanAgeGroup(activeChild.ageGroup);
      setPlanConditions([...activeChild.healthConditions]);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Calendar className="inline-block mr-2 h-6 w-6" /> 
          Meal Plans
        </h2>
        
        <Dialog open={isAddingPlan} onOpenChange={setIsAddingPlan}>
          <DialogTrigger asChild>
            <Button onClick={loadActiveChildData}>
              <Plus className="mr-2 h-4 w-4" /> Create Meal Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Meal Plan</DialogTitle>
              <DialogDescription>
                Design a daily meal plan tailored to your child's needs
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input 
                    id="planName" 
                    placeholder="e.g., Toddler Daily Plan" 
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="planAgeGroup">Target Age Group</Label>
                  <Select 
                    value={planAgeGroup} 
                    onValueChange={(value) => setPlanAgeGroup(value as AgeGroup)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">Infant/Toddler (0-2 years)</SelectItem>
                      <SelectItem value="3-6">Preschooler (3-6 years)</SelectItem>
                      <SelectItem value="7-10">School Age (7-10 years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planDescription">Description</Label>
                <Textarea 
                  id="planDescription" 
                  placeholder="Describe this meal plan..." 
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Health Considerations</Label>
                <div className="border rounded-md p-4 h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {healthConditionsList.map((condition) => {
                      const isSelected = planConditions.some(c => c.id === condition.id);
                      return (
                        <Button
                          key={condition.id}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className="mr-2 mb-2"
                          onClick={() => toggleCondition(condition)}
                        >
                          {condition.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-medium">Meals</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddMeal}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Meal
                  </Button>
                </div>
                
                {meals.map((meal, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Meal {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMeal(index)}
                        disabled={meals.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input 
                          type="time"
                          value={meal.time}
                          onChange={(e) => handleMealChange(index, "time", e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Meal Name</Label>
                        <Input 
                          placeholder="e.g., Breakfast, Snack, etc."
                          value={meal.name}
                          onChange={(e) => handleMealChange(index, "name", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        placeholder="Describe the meal and ingredients..."
                        value={meal.description}
                        onChange={(e) => handleMealChange(index, "description", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingPlan(false)}>Cancel</Button>
              <Button onClick={handleCreateMealPlan} disabled={!planName.trim() || meals.length === 0}>
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filter meal plans for the active child or show appropriate message if none exists */}
      {!activeChildId ? (
        <div className="text-center py-12 bg-amber-50 rounded-lg border border-amber-200">
          <User className="mx-auto h-12 w-12 text-amber-500" />
          <h3 className="mt-2 text-sm font-semibold text-amber-800">No Child Selected</h3>
          <p className="mt-1 text-sm text-amber-800">
            Please select a child profile to view and create meal plans
          </p>
        </div>
      ) : mealPlans.filter(plan => plan.targetAgeGroup === activeChild?.ageGroup).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No meal plans yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create structured meal plans for your child based on their nutritional needs
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              loadActiveChildData();
              setIsAddingPlan(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Your First Meal Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Only show meal plans for the active child's age group */}
          {mealPlans
            .filter(plan => plan.targetAgeGroup === activeChild?.ageGroup)
            .map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      Created {formatDate(plan.createdAt)}
                      {" • "}
                      {plan.targetAgeGroup.charAt(0).toUpperCase() + plan.targetAgeGroup.slice(1)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Pre-populate form with plan data
                        setPlanName(plan.name);
                        setPlanDescription(plan.description);
                        setPlanAgeGroup(plan.targetAgeGroup);
                        setPlanConditions(plan.healthConditions);
                        setMeals(plan.meals);
                        setEditingPlanId(plan.id);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeMealPlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {plan.healthConditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {plan.healthConditions.map((condition) => (
                      <Badge key={condition.id} variant="outline">
                        {condition.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {plan.description && (
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                )}
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="meals">
                    <AccordionTrigger className="text-md font-medium">
                      View Daily Meal Schedule
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 py-2">
                        {plan.meals.map((meal, index) => (
                          <div key={index} className="border-l-4 border-primary pl-4 py-2">
                            <div className="flex items-center mb-1">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm font-medium text-gray-600">{meal.time}</span>
                              <Utensils className="h-4 w-4 mx-2 text-gray-500" />
                              <span className="font-medium">{meal.name}</span>
                            </div>
                            {meal.description && (
                              <p className="text-sm text-gray-600 pl-6">{meal.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex items-center text-sm text-gray-600 w-full">
                  <Info className="h-4 w-4 mr-2" />
                  <p>This meal plan is designed for {plan.targetAgeGroup === "0-2" ? "infants/toddlers" : plan.targetAgeGroup === "3-6" ? "preschoolers" : "school age children"} 
                    {plan.healthConditions.length > 0 ? ` with consideration for ${plan.healthConditions.map(c => c.name.toLowerCase()).join(", ")}` : ""}.
                  </p>
                </div>
              </CardFooter>
              
              {/* Edit Plan Dialog */}
              {editingPlanId === plan.id && (
                <Dialog open={true} onOpenChange={(open) => !open && setEditingPlanId(null)}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Meal Plan</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editPlanName">Plan Name</Label>
                          <Input 
                            id="editPlanName" 
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editPlanAgeGroup">Target Age Group</Label>
                          <Select 
                            value={planAgeGroup} 
                            onValueChange={(value) => setPlanAgeGroup(value as AgeGroup)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-2">Infant/Toddler (0-2 years)</SelectItem>
                              <SelectItem value="3-6">Preschooler (3-6 years)</SelectItem>
                              <SelectItem value="7-10">School Age (7-10 years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="editPlanDescription">Description</Label>
                        <Textarea 
                          id="editPlanDescription" 
                          value={planDescription}
                          onChange={(e) => setPlanDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Health Considerations</Label>
                        <div className="border rounded-md p-4 h-40 overflow-y-auto">
                          <div className="space-y-2">
                            {healthConditionsList.map((condition) => {
                              const isSelected = planConditions.some(c => c.id === condition.id);
                              return (
                                <Button
                                  key={condition.id}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
                                  className="mr-2 mb-2"
                                  onClick={() => toggleCondition(condition)}
                                >
                                  {condition.name}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-lg font-medium">Meals</Label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleAddMeal}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Meal
                          </Button>
                        </div>
                        
                        {meals.map((meal, index) => (
                          <div key={index} className="border rounded-md p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Meal {index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMeal(index)}
                                disabled={meals.length <= 1}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Time</Label>
                                <Input 
                                  type="time"
                                  value={meal.time}
                                  onChange={(e) => handleMealChange(index, "time", e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Meal Name</Label>
                                <Input 
                                  placeholder="e.g., Breakfast, Snack, etc."
                                  value={meal.name}
                                  onChange={(e) => handleMealChange(index, "name", e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea 
                                placeholder="Describe the meal and ingredients..."
                                value={meal.description}
                                onChange={(e) => handleMealChange(index, "description", e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingPlanId(null)}>Cancel</Button>
                      <Button 
                        onClick={() => {
                          const updatedPlan: MealPlan = {
                            ...plan,
                            name: planName.trim(),
                            description: planDescription.trim(),
                            meals: meals.filter(meal => meal.name.trim() && meal.time.trim()),
                            targetAgeGroup: planAgeGroup,
                            healthConditions: planConditions
                          };
                          handleUpdateMealPlan(updatedPlan);
                        }} 
                        disabled={!planName.trim() || meals.length === 0}
                      >
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}